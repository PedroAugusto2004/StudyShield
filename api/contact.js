import { Resend } from 'resend';

function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'StudyShield <onboarding@resend.dev>';
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey) {
    return res.status(500).json({ message: 'Email service not configured' });
  }

  if (!toEmail) {
    return res.status(500).json({ message: 'Recipient email not configured' });
  }

  try {
    const resend = new Resend(apiKey);
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedSubject = sanitize(subject);
    const sanitizedMessage = sanitize(message).replace(/\n/g, '<br>');

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
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
    res.status(500).json({ message: 'Failed to send email' });
  }
}
