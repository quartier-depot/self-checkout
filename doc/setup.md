# Setup

## Devices

### Kasse

* Spectra PowerTwin-115RL-R10
* Intel(R) Atom(TM) CPU  E3845  @ 1.91GHz
* 4GB RAM
* 2 Ethernet interfaces, no WLAN
* eGalax Inc. USB TouchController Touchscreen

### Dev

* Hewlett-Packard HP ProBook 650 G1 
* Intel® Core™ i5-4300M × 4
* 8GB RAM
* 128GB SSD

## Install Dev

1. Ubuntu Desktop 24, system name "hp-ubuntu"
1. Setup fixed IP 192.168.178.65 in DEV network
1. User "abeggchr"
1. Install VS Code
1. Install Node, NPM
1. Install Git
1. Install Local https://community.localwp.com/t/installation-guide-on-ubuntu-24-04-1-lts-in-2025/46022
1. Import dump from productive WooCommerce WebShop
1. WooCommerce shop runs at https://quartierdepot-april2024.local
1. Adjust backend prerequisites as described in [README.md](../README.md)


## Install Kasse

1. Install Ubuntu Desktop 24, system name "kasse"
1. Setup fixed IP 192.168.178.144 in DEV network
1. Setup user "admin"
1. Setup SSH for user "admin" with certificates
1. Disable Password authentication in `/etc/ssh/sshd_config`
1. Edit `/etc/hosts` and add `192.168.178.65 quartierdepot-april2025.local`
1. `sudo apt install 7zip-full`
1. `wget https://www.eeti.com/touch_driver/Linux/20240510/eGTouch_v2.5.13219.L-x.7z`
1. `7z x eGTouch_v2.5.13219.L-x.7z`
1. `chmod +x ./setup.sh` and execute setup (as user "admin")
1. eGTouch Utility > calibrate Touchscreen
1. Add user "kasse" without with automatic login (Activities > System > Users > Unlock > Other Users)
1. (Activities > System > Users > Unlock > Other Users)
1. `sudo groupadd nopasswdlogin` (Passwordless login for user "kasse", see https://ubuntuhandbook.org/index.php/2019/02/enable-passwordless-login-ubuntu-18-04/)
1. `sudo editor /etc/pam.d/gdm-password`, add `auth sufficient pam_succeed_if.so user ingroup nopasswdlogin`
1. `sudo gpasswd --add kasse nopasswdlogin`
1. As "kasse":
1. Create `~/.config/autostart/firefox-kiosk.desktop` with permissions 644

## firefox-kiosk.desktop

```
[Desktop Entry]
Type=Application
Exec=firefox --kiosk http://localhost:3000
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Firefox Kiosk Mode
Comment=Start Firefox in kiosk mode on login
```

todo:
1. Remove the logout option from the system menu: `gsettings set org.gnome.desktop.lockdown disable-log-out true` (see also https://help.gnome.org/admin/system-admin-guide/stable/dconf-lockdown.html.en)
1. lock-screen
1. parental controls, allow only webbrowser


## Notes

- For the scanner to read barcodes correctly, set the keyboard layout to English.