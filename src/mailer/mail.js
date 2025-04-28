import { VERIFICATION_EMAIL_TEMPLATE ,WELCOME_EMAIL_TEMPLATE} from "./mailTemplate.js";
import transport from "./nodeMailer.config.js";

export const sendVerificationEmail=async(email,verificationToken)=>{
    try {
        const response= await transport.sendMail({
          from:process.env.SENDER_EMAIL,
          to:email,
          subject:"Verify Your Email",
          html:VERIFICATION_EMAIL_TEMPLATE.replace("{{verificationToken}}",verificationToken),
        })
        if(response)
        console.log(`✅Verification Email Sent Successfully:${response}`)
    } catch (error) {
      console.log(`❌Error in Sending Verification Email:${error}`)
    }
  }

  export const sendWelcomeEmail = async (email, ownerName,businessName ,link) => {
    try {
      const year = new Date().getFullYear();
      const htmlContent = WELCOME_EMAIL_TEMPLATE
        .replace("{{businessOwnerName}}", ownerName)
        .replace("{{businessName}}",businessName)
        .replace("{{dashboardLink}}", link)
        .replace("{{currentYear}}", year);
  
      const response = await transport.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: `Welcome to POS!`,
        html: htmlContent,
      });
  
      if (response) {
        console.log(`✅ Welcome Email Sent Successfully: ${response.response}`);
      }
    } catch (error) {
      console.error(`❌ Welcome Email Error: ${error}`);
    }
  };
  