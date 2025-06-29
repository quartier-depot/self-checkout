# Setup

## Devices

### Laptop

* Hewlett-Packard HP ProBook 650 G1 
* Intel® Core™ i5-4300M × 4
* 8GB RAM
* 128GB SSD

### Screen

* ELO 1509L Touchscreen Monitor

## Install

1. Install Ubuntu Desktop 24, system name "quartier-depot-kasse"
2. Setup fixed IP 192.168.178.65 in DEV network on router
3. Add user "admin"
4. Switch to user "admin"
5. Setup SSH with certificates ([see link](https://linuxconfig.org/quick-guide-to-enabling-ssh-on-ubuntu-24-04))
6. System > Users > Other Users > kasse > automatic login
7. System > Users > Other Users > kasse > not an admin
8. `sudo groupadd nopasswdlogin` (add passwordless login group, [see link](https://ubuntuhandbook.org/index.php/2019/02/enable-passwordless-login-ubuntu-18-04/))
9. `sudo editor /etc/pam.d/gdm-password`, add `auth sufficient pam_succeed_if.so user ingroup nopasswdlogin`
10. `sudo gpasswd --add kasse nopasswdlogin`
11. `sudo apt-get install podman`




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