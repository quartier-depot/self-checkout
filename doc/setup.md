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
2. Setup fixed IP 192.168.178.65 in DEV network
3. User "abeggchr"
4. Install VS Code
5. Install Node, NPM
6. Install Git
7. Install Local https://community.localwp.com/t/installation-guide-on-ubuntu-24-04-1-lts-in-2025/46022
8. Import dump from productive WooCommerce WebShop
9. WooCommerce shop runs at https://quartierdepot-april2024.local
10. Adjust backend prerequisites as described in [README.md](../README.md)


## Install Kasse

1. Install Ubuntu Desktop 24, system name "kasse"
2. Setup fixed IP 192.168.178.144 in DEV network
3. Setup user "admin"
4. Setup SSH for user "admin" with certificates
5. Disable Password authentication in `/etc/ssh/sshd_config`
6. Edit `/etc/hosts` and add `192.168.178.65 quartierdepot-april2025.local`
7. `sudo apt install 7zip-full`
8. `wget https://www.eeti.com/touch_driver/Linux/20240510/eGTouch_v2.5.13219.L-x.7z`
9. `7z x eGTouch_v2.5.13219.L-x.7z`
10. `chmod +x ./setup.sh` and execute setup (as user "admin")
11. eGTouch Utility > calibrate Touchscreen
12. Add user "kasse" without with automatic login (Activities > System > Users > Unlock > Other Users)
13. (Activities > System > Users > Unlock > Other Users)
14. `sudo groupadd nopasswdlogin` (Passwordless login for user "kasse", see https://ubuntuhandbook.org/index.php/2019/02/enable-passwordless-login-ubuntu-18-04/)
15. `sudo editor /etc/pam.d/gdm-password`, add `auth sufficient pam_succeed_if.so user ingroup nopasswdlogin`
16. `sudo gpasswd --add kasse nopasswdlogin`
17. As "kasse":
18. Create `~/.config/autostart/firefox-kiosk.desktop` with permissions 644 (see below)
19. Disable "automatic screen lock" in settings

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
* Remove the logout option from the system menu: `gsettings set org.gnome.desktop.lockdown disable-log-out true` (see also https://help.gnome.org/admin/system-admin-guide/stable/dconf-lockdown.html.en)
* parental controls, allow only webbrowser
* dash remove
* backgorund image


## Notes

- For the scanner to read barcodes correctly, set the keyboard layout to English.