// Professional email templates with HTML formatting
export const emailTemplates = {
  welcomeEmail: {
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{recipient_name}},</p>
        
        <p>Welcome to {{company_name}}! We're excited to have you with us.</p>
        
        <p>Your account has been set up and will be active from {{start_date}}.</p>

        <p>If you have any questions, feel free to reach out to us.</p>

        <p>Best regards,<br>
        {{sender_name}}</p>
      </div>
    `,
    fields: [
      { name: 'company_name', type: 'text' },
      { name: 'recipient_name', type: 'text' },
      { name: 'start_date', type: 'date' },
      { name: 'sender_name', type: 'text' }
    ]
  },

  meetingSchedule: {
    name: 'Meeting Schedule',
    subject: 'Meeting Scheduled: {{meeting_title}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{recipient_name}},</p>
        
        <p>This is to confirm our upcoming meeting.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Meeting Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li>Title: {{meeting_title}}</li>
            <li>Date: {{meeting_date}}</li>
            <li>Time: {{meeting_time}}</li>
          </ul>
        </div>

        <p>Best regards,<br>
        {{sender_name}}</p>
      </div>
    `,
    fields: [
      { name: 'recipient_name', type: 'text' },
      { name: 'meeting_title', type: 'text' },
      { name: 'meeting_date', type: 'date' },
      { name: 'meeting_time', type: 'time' },
      { name: 'sender_name', type: 'text' }
    ]
  },

  followUp: {
    name: 'Follow Up',
    subject: 'Following up on {{topic}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{recipient_name}},</p>
        
        <p>I hope you're doing well. I'm following up regarding {{topic}}.</p>
        
        <p>Would you be available for a quick discussion on {{proposed_date}}?</p>

        <p>Best regards,<br>
        {{sender_name}}</p>
      </div>
    `,
    fields: [
      { name: 'recipient_name', type: 'text' },
      { name: 'topic', type: 'text' },
      { name: 'proposed_date', type: 'date' },
      { name: 'sender_name', type: 'text' }
    ]
  }
}; 