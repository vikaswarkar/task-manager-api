const { setTwilioEmailAuth } = require('@sendgrid/mail')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (toEmail, name)=>{
    sgMail.send({
        to: 'vikaswarkar@gmail.com',
        from: 'vikaswarkar@gmail.com',
        subject: 'Welcome to Task Manager App',
        text: `Welcome to the App, ${name}`
    })
}

const sendCancellationEmail = (toEmail, name)=>{
    sgMail.send({
        to: 'vikaswarkar@gmail.com',
        from: 'vikaswarkar@gmail.com',
        subject: 'Please dont go!!',
        text: `Welcome to the App, ${name}`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
} 
