import { Resend } from 'resend';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Sanitize all user inputs to prevent XSS
    const sanitizedName = purify.sanitize(name, { ALLOWED_TAGS: [] });
    const sanitizedEmail = purify.sanitize(email, { ALLOWED_TAGS: [] });
    const sanitizedSubject = purify.sanitize(subject, { ALLOWED_TAGS: [] });
    const sanitizedMessage = purify.sanitize(message.replace(/\n/g, '<br>'), { ALLOWED_TAGS: ['br'] });

    await resend.emails.send({
      from: 'StudyShield <onboarding@resend.dev>',
      to: ['pa405369@gmail.com'],
      subject: `Contact Form: ${sanitizedSubject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Subject:</strong> ${sanitizedSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage}</p>
      `,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
}