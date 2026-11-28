import { Link } from "react-router-dom";
import {
  ClipboardList,
  ShieldAlert,
  Users,
  FileText,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

function CommunityChallengePage() {
  return (
    <div className="community-challenge-page container">
      <section className="challenge-hero">
        <p className="eyebrow">
          <ClipboardList size={18} />
          Community Participation
        </p>

        <h1>Community Challenge Reporting</h1>

        <p className="lead">
          Help improve services by documenting challenges affecting your
          community. Your reports connect directly with service organizations
          working to address gaps and improve access.
        </p>
      </section>

      <div className="challenge-notice info">
        <ShieldAlert size={22} />
        <div>
          <strong>Your Safety First</strong>
          <p>
            All reports are designed to protect your identity. Report general
            service challenges without sharing personal or identifying
            information.
          </p>
        </div>
      </div>

      <section className="challenge-how-it-works">
        <h2>How Community Reporting Works</h2>

        <div className="challenge-steps-grid">
          <div className="challenge-step-card">
            <div className="step-icon">
              <FileText size={28} />
              <span className="step-number">1</span>
            </div>
            <h3>Identify a Challenge</h3>
            <p>
              Notice a service gap, accessibility issue, or challenge affecting
              your community's access to essential services.
            </p>
          </div>

          <div className="challenge-step-card">
            <div className="step-icon">
              <MessageSquare size={28} />
              <span className="step-number">2</span>
            </div>
            <h3>Submit a Report</h3>
            <p>
              Select the relevant organization and describe the challenge using
              general, non-identifying information.
            </p>
          </div>

          <div className="challenge-step-card">
            <div className="step-icon">
              <Users size={28} />
              <span className="step-number">3</span>
            </div>
            <h3>Organization Review</h3>
            <p>
              The selected organization receives your report securely and reviews
              it with their team.
            </p>
          </div>

          <div className="challenge-step-card">
            <div className="step-icon">
              <CheckCircle size={28} />
              <span className="step-number">4</span>
            </div>
            <h3>Action Taken</h3>
            <p>
              Organizations work to address reported challenges, improving
              services for the entire community.
            </p>
          </div>
        </div>
      </section>

      <section className="challenge-guidelines">
        <h2>Reporting Guidelines</h2>

        <div className="guidelines-grid">
          <div className="guideline-card do">
            <div className="guideline-header">
              <CheckCircle size={24} />
              <h3>Do Report</h3>
            </div>
            <ul>
              <li>General service accessibility issues</li>
              <li>Service gaps affecting the community</li>
              <li>Infrastructure challenges</li>
              <li>Service quality concerns</li>
              <li>Communication barriers</li>
              <li>Transportation difficulties</li>
            </ul>
          </div>

          <div className="guideline-card dont">
            <div className="guideline-header">
              <ShieldAlert size={24} />
              <h3>Don't Share</h3>
            </div>
            <ul>
              <li>Personal identifying information</li>
              <li>Names of individuals</li>
              <li>Sensitive personal details</li>
              <li>Medical information</li>
              <li>Financial details</li>
              <li>Exact addresses or locations</li>
            </ul>
          </div>
        </div>

        <div className="guideline-example">
          <Lightbulb size={22} />
          <div>
            <strong>Example of Good Reporting</strong>
            <p>
              <em>Good:</em> "The health clinic in Zone 3 has limited hours on
              weekends, making it difficult for working community members to
              access services."
            </p>
            <p>
              <em>Avoid:</em> "My neighbor John Smith at tent 123 can't get to
              the clinic because he works."
            </p>
          </div>
        </div>
      </section>

      <section className="challenge-categories">
        <h2>What You Can Report</h2>

        <div className="category-cards">
          <div className="category-card">
            <h4>Healthcare Access</h4>
            <p>
              Challenges accessing medical services, clinic hours, medication
              availability, or health information.
            </p>
          </div>

          <div className="category-card">
            <h4>Education</h4>
            <p>
              School enrollment barriers, learning material shortages,
              language support, or education facility issues.
            </p>
          </div>

          <div className="category-card">
            <h4>Water & Sanitation</h4>
            <p>
              Water access points, quality concerns, sanitation facilities, or
              hygiene supply availability.
            </p>
          </div>

          <div className="category-card">
            <h4>Food Security</h4>
            <p>
              Distribution timing, food quality, dietary requirements, or access
              challenges for vulnerable groups.
            </p>
          </div>

          <div className="category-card">
            <h4>Shelter & Infrastructure</h4>
            <p>
              Housing conditions, infrastructure repair needs, lighting, roads,
              or communal facility access.
            </p>
          </div>

          <div className="category-card">
            <h4>Protection Services</h4>
            <p>
              Safety concerns, accessibility of protection services, or gaps in
              support for vulnerable populations.
            </p>
          </div>

          <div className="category-card">
            <h4>Legal & Documentation</h4>
            <p>
              Documentation processes, legal assistance access, or information
              gaps about rights and procedures.
            </p>
          </div>

          <div className="category-card">
            <h4>Accessibility</h4>
            <p>
              Physical barriers, language support, disability accommodation, or
              other accessibility challenges.
            </p>
          </div>
        </div>
      </section>

      <section className="challenge-impact">
        <div className="impact-content">
          <h2>Your Voice Matters</h2>
          <p>
            Community reports help organizations understand real challenges and
            prioritize improvements. When you report a challenge:
          </p>

          <ul className="impact-list">
            <li>
              <CheckCircle size={20} />
              Organizations gain insight into community needs
            </li>
            <li>
              <CheckCircle size={20} />
              Patterns emerge that guide resource allocation
            </li>
            <li>
              <CheckCircle size={20} />
              Services improve based on actual community feedback
            </li>
            <li>
              <CheckCircle size={20} />
              Your community's voice influences decision-making
            </li>
          </ul>
        </div>
      </section>

      <section className="challenge-privacy">
        <div className="privacy-card">
          <ShieldAlert size={32} />
          <div>
            <h3>Your Privacy & Safety</h3>
            <p>
              All reports are anonymous by default. Organizations receive your
              feedback without any identifying information unless you explicitly
              choose to share contact details for follow-up.
            </p>
            <p>
              Reports are stored securely and used only to improve services.
              Never include sensitive personal information in your report
              descriptions.
            </p>
          </div>
        </div>
      </section>

      <section className="challenge-cta">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>
            Help your community by reporting service challenges. Your feedback
            drives positive change.
          </p>

          <div className="cta-actions">
            <Link to="/report" className="btn btn-primary btn-lg">
              Submit a Report
              <ArrowRight size={20} />
            </Link>

            <Link to="/services" className="btn btn-outline btn-lg">
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      <section className="challenge-faq">
        <h2>Frequently Asked Questions</h2>

        <div className="faq-list">
          <details className="faq-item">
            <summary>What happens after I submit a report?</summary>
            <p>
              Your report is sent directly to the organization you selected. They
              review it and determine appropriate action. While you won't receive
              individual responses, your feedback contributes to service
              improvements.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I report the same issue multiple times?</summary>
            <p>
              If a challenge persists or worsens, you can submit additional
              reports. This helps organizations understand the urgency and scope
              of the issue.
            </p>
          </details>

          <details className="faq-item">
            <summary>Is my report truly anonymous?</summary>
            <p>
              Yes. By default, reports do not include any identifying
              information. The organization receives only the description you
              provide. If you check the "not anonymous" option, only the
              organization you selected can see your contact information.
            </p>
          </details>

          <details className="faq-item">
            <summary>What if I need urgent help?</summary>
            <p>
              Community reports are for documenting general service challenges,
              not emergencies. For urgent assistance, contact emergency services
              directly or visit the Services Directory to find immediate support.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I report on behalf of someone else?</summary>
            <p>
              Yes, but always use general descriptions without identifying the
              individual. Focus on the service gap or challenge rather than
              personal details.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}

export default CommunityChallengePage;
