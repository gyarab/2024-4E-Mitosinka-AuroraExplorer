const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/User');

//defining the NotificationService class
class NotificationService {
  constructor() {
    //set up the transporter for sending emails using Gmail
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
  }
  // method to calculate the distance between two geographical points using the Haversine formula 
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; //radius of earth
    const dLat = (lat2 - lat1) * Math.PI / 180; //latitude difference to radians
    const dLon = (lon2 - lon1) * Math.PI / 180; //longtitude difference to radians
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); //the haversine formula
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // angular distance in radians
    return R * c; //distance in kilometers 
  }
  //find a user within a specific range of given location
  async findUsersInRange(latitude, longitude) {
    try {
      //fetching users with existing location and notification ON
      const users = await User.find({
        location: { $exists: true },
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true },
        notificationsEnabled: true
      });

      //filtering users using previous method based on if they are in the alert radius
      return users.filter(user => {
        if (!user.location || !user.alertRadius) return false;

        const distance = this.calculateDistance(
          user.location.latitude,
          user.location.longitude,
          latitude,
          longitude
        );

        return distance <= user.alertRadius; //check if the distance is within alert radius
      });
    } catch (error) {
      console.error('Error finding users in range:', error);
      return [];
    }
  }
  //sending email alerts to users 
  async sendAuroraAlert(user, postData) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'New Aurora Sighting Near You! 🌠',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Aurora Sighting Alert! ✨</h2>
          <p>Hello ${user.userName},</p>
          <p>A new aurora has been spotted within your alert radius!</p>
          <div style="margin: 20px 0;">
            <img src="${postData.imageUrl}" alt="Aurora Sighting" style="max-width: 100%; border-radius: 8px;">
          </div>
          <p><strong>Description:</strong> ${postData.description || 'No description provided'}</p>
          <p><strong>Posted:</strong> ${new Date().toLocaleString()}</p>
          <a href="${process.env.WEBSITE_URL}/aurorex" 
             style="display: inline-block; padding: 10px 20px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 5px;">
            View Aurora Posts
          </a>
          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            To adjust your notification settings, visit your profile page.
          </p>
        </div>
      `
    };

    try {
      //sending email using transporter
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Alert sent to ${user.email}:`, result.messageId);//log successful email send
      return true;
    } catch (error) {
      console.error(`Error sending alert to ${user.email}:`, error);
      return false;
    }
  }
}


module.exports = new NotificationService();