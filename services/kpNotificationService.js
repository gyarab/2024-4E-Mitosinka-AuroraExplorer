// class for handleing email notifications with high kp index values

const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/User');

class KpNotificationService {
    //initialize nodemailer transport using gmail
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        //track last notification time for each user
        this.lastNotificationTimes = new Map();
    }

    //find users in db who havee highKpNotifications enabled and have valid email address
    async findUsersWithKpNotifications() {
        try {
            return await User.find({
                notificationsForHighKp: true,
                email: { $exists: true }
            });
        } catch (error) {
            console.error('Error finding users for KP notifications:', error);
            return [];
        }
    }

    //send email alerts
    //user-object with email and username
    //kpData-object with timestamps and kp values
    async sendHighKpAlert(user, kpData) {

        //check if notification was sent in last 24 hours
        const lastNotificationTime = this.lastNotificationTimes.get(user.email);
        const currentTime = Date.now();

        if (lastNotificationTime && (currentTime - lastNotificationTime < 24 * 60 * 60 * 1000)) {
            console.log(`Not sending notification for ${user.email} because it was already sent in past 24 hours`);
            return false;
        }


        //find highest kp value and its corresponding time
        const maxKp = Math.max(...Object.values(kpData));
        const timeOfHighestKp = Object.entries(kpData)
            .find(([time, value]) => value === maxKp)[0];

        //configure email content with HTML
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🌠 High Aurora Activity Alert!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>High Aurora Activity Expected! ✨</h2>
          <p>Hello ${user.userName},</p>
          <p>Strong aurora activity is forecasted with a Kp index of ${maxKp} at ${timeOfHighestKp} UTC!</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h3>Forecast Details:</h3>
            <ul style="list-style: none; padding: 0;">
              ${Object.entries(kpData)
                    .map(([time, value]) =>
                        `<li style="margin: 10px 0;">
                    <strong>${time} UTC:</strong> Kp ${value}
                    ${value === maxKp ? ' (Peak Activity)' : ''}
                  </li>`
                    ).join('')}
            </ul>
          </div>
          <p style="margin-top: 20px; color: #666;">
            Remember that aurora visibility depends on various factors including weather conditions and your location.
          </p>
          <a href="${process.env.WEBSITE_URL}/forecast"
             style="display: inline-block; padding: 10px 20px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Check Aurora Posts
          </a>
          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            To adjust your notification settings, visit your profile page.
          </p>
        </div>
      `
        };
        //try sending email
        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`High KP alert sent to ${user.email}:`, result.messageId);

            //update last notification time for this user
            this.lastNotificationTimes.set(user.email, currentTime);

            return true;
        } catch (error) {
            console.error(`Error sending KP alert to ${user.email}:`, error);
            return false;
        }
    }

    //check kp values and send notifications
    async checkAndNotifyUsers(kpData) {
        //send emails for values higher than 5
        const hasHighKp = Object.values(kpData).some(value => value >= 5);

        //if no kp index higher than 5, donto send emails
        if (!hasHighKp) {
            console.log('No higher than 5 KP values found');
            return;
        }

        //find users who should receive notifications
        const users = await this.findUsersWithKpNotifications();

        //send alerts to each valid user
        for (const user of users) {
            console.log('Sending alert to user:', user.email);
            await this.sendHighKpAlert(user, kpData);
        }
    }
}

//export singleton instance of this service
module.exports = new KpNotificationService();