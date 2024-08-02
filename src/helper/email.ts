import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { MailOptions } from '../types/userTypes'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ansud.itpathsolutions@gmail.com',
    pass: 'zazz vaeg mpnc yrsq',
  },
})

export const sendResetPasswordEmail = async (email: string, resetLink: string): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/html/resetPassword.html')
  let htmlTemplate = ''

  try {
    htmlTemplate = fs.readFileSync(templatePath, 'utf8')
  } catch (error) {
    console.error('Error reading HTML template:', error)
    throw new Error('Error reading HTML template')
  }

  // Replace placeholder with the actual reset link
  const emailBody = htmlTemplate.replace('{{resetLink}}', resetLink)

  const mailOptions: MailOptions = {
    from: 'ansud.itpathsolutions@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: emailBody,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully')
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Error sending password reset email')
  }
}
