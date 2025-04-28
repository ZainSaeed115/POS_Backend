import nodemailer from "nodemailer";

console.log("Sender:",process.env.SENDER_EMAIL);
console.log("password",process.env.EMAIL_PASSWORD)
const transport=nodemailer.createTransport({
    service:"gmail",
    secure:true,
    port:465,
    auth:{
        user:process.env.SENDER_EMAIL,
        pass:process.env.EMAIL_PASSWORD
    }
});
export default transport;