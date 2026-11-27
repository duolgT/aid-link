# Implementation TODO

## Completed ✅
- [x] Updated ReportForm with organization dropdown
- [x] Report form loads organizations from API
- [x] Logout button already in Navbar

## Remaining Tasks

### 1. Email Verification System 📧
- [ ] Add `verification_code` and `verified` columns to organizations table
- [ ] Create email sending service (using nodemailer)
- [ ] Update registration endpoint to send verification email
- [ ] Create verification endpoint
- [ ] Add verification page in frontend
- [ ] Show "verify email" message after registration

### 2. UI Improvements for Management Pages 🎨
- [ ] Redesign ManageReportsPage to match project design
- [ ] Redesign ManageServicesPage to match project design
- [ ] Redesign ManageGuidesPage to match project design
- [ ] Add proper empty states
- [ ] Add loading states
- [ ] Add better error handling

### Priority: 
1. Fix management pages UI (simpler is better)
2. Add email verification

Note: Email verification requires SMTP configuration which may be complex for local development. Consider making it optional for now.
