process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Load environment variables from ../app/.env
const API_URL = `${process.env.WORDPRESS_URL}/wp-json/wp/v2`;
const APPLICATION_PASSWORD = process.env.WORDPRESS_APPLICATION_PASSWORD;
const APPLICATION_USER = process.env.WORDPRESS_APPLICATION_USER;

if (!API_URL || !APPLICATION_USER || !APPLICATION_PASSWORD) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Basic Auth token
const basicAuth = Buffer.from(`${APPLICATION_USER}:${APPLICATION_PASSWORD}`).toString('base64');
const authHeader = `Basic ${basicAuth}`;

// Function to generate a unique member ID
function generateMemberId() {
  return `M${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;
}

// Function to update user with new member ID
async function updateUserMemberId(userId, memberId) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      acf: {
        member_id: memberId
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update user ${userId}: ${response.statusText}`);
  }
}

// Main function to process all users
async function main() {
  try {
    // Get all users with subscriber and customer roles
    let page = 1;
    const users = [];
    while (true) {
      console.log(`Fetching page ${page}...`);
      const response = await fetch(`${API_URL}/users?per_page=100&roles[]=subscriber&roles[]=customer&page=${page}`, {
        headers: {
          'Authorization': authHeader
        }
      });
      const pageUsers = await response.json();
      console.log(`Found ${pageUsers.length} users on page ${page}`);
      
      if (pageUsers.length === 0) {
        break;
      } else {
        users.push(...pageUsers);
      }
      
      page++;
    }

    console.log(`Found ${users.length} users`);
    
    // get all member ids
    const memberIds = [];
    for (const user of users) {
      if (user.acf?.member_id) {
        memberIds.push(user.acf.member_id);
      }
    }
    
    for (const user of users) {
      if (!user.acf?.member_id) {
        let memberId;
        let isUnique = false;

        // Generate unique member ID
        do {
          memberId = generateMemberId();
          isUnique = !memberIds.includes(memberId);
        } while (!isUnique);

        // Update user with new member ID
        await updateUserMemberId(user.id, memberId);
        console.log(`${user.id} > ${memberId} NEW`);
      } else {
        console.log(`${user.id} > ${user.acf.member_id}`);
      }
    }

    console.log('Successfully processed all users');
  } catch (error) {
    console.error('Error processing users:', error);
    process.exit(1);
  }
}

main();