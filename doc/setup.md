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
9. WooCommerce shop runs at https://quartier-depot-test.local
10. Adjust backend prerequisites as described in [README.md](../README.md)


## Install Kasse

1. Install Ubuntu Desktop 24, system name "kasse"
2. Setup fixed IP 192.168.178.144 in DEV network on router
3. Setup user "admin"
4. (optional) Setup SSH for user "admin" with certificates
5. Disable Password authentication in `/etc/ssh/sshd_config`
6. Edit `/etc/hosts` and add `192.168.178.65 https://quartier-depot-test.local`
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
17. `snap login`
18. `snap install quartier-depot-self-checkout`
19. `snap set quartier-depot-self-checkout ...` (see README.md)
20. Install `sudo apt install unattended-upgrades`
21. `systemctl status unattended-upgrades` should be active + running
22. `sudo vi /etc/apt/apt/apt.conf.d/20auto-upgrades` > both lines should be enabled
23. `sudo vi /etc/apt/apt/apt.conf.d/50unattended-upgrades`
   * uncomment "${distro_id}:${distro_codename}-updates"; 
   * uncomment "${distro_id}:${distro_codename}-proposed";
   * uncomment "${distro_id}:${distro_codename}-backports";
   * set "Unattended-Upgrade::InstallOnShutdown "true";
24. Create `/etc/systemd/system/snap-update-shutdown.service`  and `/etc/systemd/system/snap-update-shutdown.timer` (see below)
25. `sudo systemctl daemon-reload`
26. `sudo systemctl enable snap-update-shutdown.timer`
27. `sudo systemctl start snap-update-shutdown.timer`
28. `sudo systemctl status snap-update-shutdown.timer` or `sudo systemctl status snap-update-shutdown.service` to verify
29. As "kasse":
30. Create `~/.config/autostart/firefox-kiosk.desktop` with permissions 644 (see below)
31. Disable "automatic screen lock" in settings
32. Set keyboard layout to English (for the scanner to read barcodes correctly) 


### ~/.config/autostart/firefox-kiosk.desktop

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

### /etc/systemd/system/snap-update-shutdown.service

[Unit]
Description=Update snaps and shutdown system
After=network.target

[Service]
Type=oneshot
# First stop all running snap services
ExecStartPre=/bin/sh -c 'snap list | grep -v "^Name" | awk "{print \$1}" | xargs -r snap stop'
# Then refresh all snaps
ExecStart=/bin/sh -c 'snap refresh && shutdown -h now'
User=root

[Install]
WantedBy=multi-user.target

### /etc/systemd/system/snap-update-shutdown.timer

[Unit]
Description=Run snap updates and shutdown at 2am

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target


Possible TODOs:

* Remove the logout option from the system menu: `gsettings set org.gnome.desktop.lockdown disable-log-out true` (see also https://help.gnome.org/admin/system-admin-guide/stable/dconf-lockdown.html.en)
* parental controls, allow only webbrowser
* dash remove
* background image