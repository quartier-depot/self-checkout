# Setup

## Devices

### Laptop

* Hewlett-Packard HP ProBook 650 G1 
* Intel® Core™ i5-4300M × 4
* 8GB RAM
* 128GB SSD

### Screen

* ELO 1509L Touchscreen Monitor

### Scanner

* Honeywell 7580g

## Install

### Scanner

* Activate Custom Defaults (1 - 6, DEFALT.)
* Streaming Presentation - Mobile Phone (3 - 10, PAPSPC.)
* Beeper Volume Good Read - Low (3-2,. BEPLVL1.) oder Beeper Good Read Off (3-2, BEPBEP1.)

### General

1. Install Ubuntu Desktop 24, system name "quartier-depot-kasse", user "kasse"
2. Setup fixed IP 192.168.178.65 in DEV network on router
3. Add user "admin"

### Admin

1. Switch to user "admin"
2. Setup SSH ([see link](https://linuxconfig.org/quick-guide-to-enabling-ssh-on-ubuntu-24-04))
3. Allow ony user "admin" to SSH:
    * `sudo nano /etc/ssh/sshd_config`
    * add `AllowUsers otheruser`
    * `sudo systemctl restart sshd`
4. System > Users > Other Users > kasse > automatic login
5. System > Users > Other Users > kasse > not an admin
6. `sudo groupadd nopasswdlogin` (add passwordless login group, [see link](https://ubuntuhandbook.org/index.php/2019/02/enable-passwordless-login-ubuntu-18-04/))
7. `sudo editor /etc/pam.d/gdm-password`, add `auth sufficient pam_succeed_if.so user ingroup nopasswdlogin`
8. `sudo gpasswd --add kasse nopasswdlogin`
9. Download driver for Touchscreen [64 bit Multi-Touch USB Driver (AMD64/Intel - x86_64)](https://assets.ctfassets.net/of6pv6scuh5x/5VjIPJkh9TYLqu8EMIwGHu/9ddc1d2347c4aba3ba9939f4ea01a7e7/SW603069_Elo_Linux_MT_USB_Driver_v4.4.0.0_x86_64.tgz)
10. Install following the [installation instructions](https://assets.ctfassets.net/of6pv6scuh5x/6KeK55CH83sFuNlGlmgr0D/32b557e47e3e52b59e0e409c4961b9ac/Installation_Instruction.txt)
    * `cp -r ./bin-mt-usb/  /etc/opt/elo-mt-usb`
    * `cd /etc/opt/elo-mt-usb`
    * `chmod 777`
    * `chmod 444 *.txt`
    * `cp /etc/opt/elo-mt-usb/99-elotouch.rules /etc/udev/rules.d`
    * `cp /etc/opt/elo-mt-usb/elo.service /etc/systemd/system/`
    * `systemctl enable elo.service`
11. Set touchscreen matrix as it is not correct
    * `vi /etc/udev/rules.d/99-elotouch.rules`
    * add `ATTRS{name}=="Elo multi-touch digitizer - 0 - 04e7:0020", ENV{LIBINPUT_CALIBRATION_MATRIX}="-1 0 1 0 -1 1 0 0 1"`
    * `sudo udevadm control --reload`
    * `sudo udevadm trigger`
    * `sudo reboot`
12. `sudo apt-get install libmotif-common libxm4` (to be able to start elo cpl)
13. `sudo apt-get install podman`
14. `systemctl --user enable podman.socket`
15. `systemctl --user start podman.socket`
16. `sudo apt install unattended-upgrades`
17. `systemctl status unattended-upgrades` should be active and running
18. `sudo vi /etc/apt/apt/apt.conf.d/20auto-upgrades` > both lines should be enabled
19. `sudo vi /etc/apt/apt/apt.conf.d/50unattended-upgrades`
    * uncomment "${distro_id}:${distro_codename}-updates"; 
    * uncomment "${distro_id}:${distro_codename}-proposed";
    * uncomment "${distro_id}:${distro_codename}-backports";
    * set "Unattended-Upgrade::InstallOnShutdown "true";
20. `sudo loginctl enable-linger admin` (allow services to run without admin being logged in)
21. `sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 admin` (onfigure subuid and subgid mappings for the admin user if not already set)
22. `sudo mkdir -p /home/admin/.config/systemd/user/`
23. Create a personal access token with read access to packages in [GitHub](https://github.com/settings/tokens)
24. Create `/home/admin/nightly-maintenance.sh` (see below)
25. `sudo chmod 700 /home/admin/nightly-maintenance.sh`
26. `sudo visudo -f /etc/sudoers.d/nightly-maintenance`
    * // Allow admin user to run specific commands without password
    * admin ALL=(ALL) NOPASSWD: /usr/bin/snap refresh
    * admin ALL=(ALL) NOPASSWD: /usr/sbin/reboot
    * admin ALL=(ALL) NOPASSWD: /usr/bin/pkill
27. `sudo chmod 440 /etc/sudoers.d/nightly-maintenance`
28. Create `/home/admin/.config/systemd/user/nightly-maintenance.timer` (see below)
29. `sudo chmod 644 /home/admin/.config/systemd/user/nightly-maintenance.timer`
30. Create `/home/admin/.config/systemd/user/nightly-maintenance.service` (see below)
31. `sudo chmod 644 /home/admin/.config/systemd/user/nightly-maintenance.service`
32. Create `/etc/logrotate.d/nightly-maintenance` (see below)
33. Create `/home/admin/.config/systemd/user/quartier-depot-self-checkout-container.service` (see below)
34. `sudo chmod 644 /etc/systemd/system/quartier-depot-self-checkout-container.service`
35. `systemctl --user daemon-reload`
36. `systemctl --user enable nightly-maintenance.timer`
37. `systemctl --user start nightly-maintenance.timer`
38. `systemctl --user enable quartier-depot-self-checkout-container`
39. `systemctl --user start quartier-depot-self-checkout-container`
40. Create `/home/admin/self-checkout.env` (see template)
41. `sudo chmod 600 /home/admin/self-checkout.env`
42. [Switch Ubuntu permanently to XOrg](https://youtu.be/Ec0oWmUdrRE) in `/etc/gdm3/custom.conf`

### Kasse 

1. As user "kasse":
2. Create `~/.config/autostart/firefox-kiosk.desktop` with permissions 644 (see below)
3. Disable "automatic screen lock" in settings
4. Enable "blank screen" after 15 mins in settings
5. Disable "go to suspend" in settings
6. Set keyboard-layout to English (for the scanner to read barcodes correctly)
7. Start `/etc/opt/elo-mt-usb/cpl` and configure beep-on-touch sound (275, 20)
8. Set "Autplay" to "Allow Audio and Video" in [Firefox](https://support.mozilla.org/en-US/kb/block-autoplay)

### /home/admin/nightly-maintenance.sh

```bash
#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/nightly-maintenance.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo
echo "===== Nightly Maintenance Started at $(date) ====="

# 1. Stop firefox
echo "[INFO] Stopping Firefox ..."
sudo pkill firefox || echo "[WARN] Firefox was not running."

# 2. Refresh snaps
echo "[INFO] Refreshing snaps..."
sudo snap refresh

# 3. Stop container
echo "[INFO] Stopping quartier-depot-container..."
systemctl --user stop quartier-depot-self-checkout-container

# 4. Pull latest image
echo "[INFO] Pulling latest image"
echo <PAT> | podman login ghcr.io -u quartier-depot --password-stdin
podman pull ghcr.io/quartier-depot/self-checkout:latest

# 5. Reboot
echo "[INFO] Rebooting the system..."
sudo reboot

```

### /home/admin/.config/systemd/user/nightly-maintenance.service

```
[Unit]
Description=Nightly Maintenance Script
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/nightly-maintenance.sh
WorkingDirectory=/home/admin
```

### /home/admin/.config/systemd/user/nightly-maintenance.timer

```
[Unit]
Description=Run nightly maintenance at 2:00 AM daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### /etc/logrotate.d/nightly-maintenance

```
/var/log/nightly-maintenance.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```

### /home/admin/.config/systemd/user/quartier-depot-self-checkout-container.service

```
[Unit]
Description=Quartier-Depot Self-Checkout Container
Requires=podman.socket
After=network.target podman.socket
Wants=network-online.target

[Service]
Restart=always
ExecStart=/usr/bin/podman run --name=quartier-depot-container --env-file /home/admin/self-checkout.env -p 3000:3000 ghcr.io/quartier-depot/self-checkout:latest
ExecStop=/usr/bin/podman stop quartier-depot-container
ExecStopPost=/usr/bin/podman rm -f quartier-depot-container

[Install]
WantedBy=default.target
```

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


## Log Files / Debug

* `systemctl --user status nightly-maintenance.timer`
* `systemctl --user status quartier-depot-self-checkout-container`
* `journalctl --user -u quartier-depot-self-checkout-container.service -n 50 --no-pager`
* `sudo grep unattended-upgrades /var/log/syslog`
* `sudo cat /var/log/nightly-maintenance.log`
* `sudo podman image list --all`
* `sudo podman container list --all`
* `sudo podman container prune --all`
* `systemctl --user daemon-reload` and `systemctl --user enable nightly-maintenance.timer` after changing `nightly-maintenance.timer`


Possible TODOs:

* Remove the logout option from the system menu: `gsettings set org.gnome.desktop.lockdown disable-log-out true` (see also https://help.gnome.org/admin/system-admin-guide/stable/dconf-lockdown.html.en)
* parental controls, allow only webbrowser
* dash remove
* background image