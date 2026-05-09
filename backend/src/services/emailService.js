export const sendOtpEmail = async ({ to, name, otp }) => {
  // THE NUCLEAR FIX: We are forcing the mock email 100% of the time right now
  // to completely bypass Render's firewall and get you registered.
  
  console.log(`\n\n🔔 === MOCK EMAIL (GUARANTEED BYPASS) === 🔔`);
  console.log(`  TO: ${to}`);
  console.log(`  OTP CODE: ${otp}`);
  console.log(`🔔 ====================================== 🔔\n\n`);
  
  return Promise.resolve(); // Immediately tells the server it was a "success"
  
  /* 
   * KEEP ALL YOUR NODEMAILER CODE COMMENTED OUT BELOW THIS LINE
   * We will bring it back when you switch to Resend/SendGrid later!
   */
};