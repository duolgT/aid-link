/**
 * In-memory database for development
 * Replace with MongoDB/PostgreSQL in production
 */

class Database {
  constructor() {
    this.organizations = [];
    this.reports = [];
  }

  // Organization methods
  createOrganization(org) {
    const organization = {
      id: crypto.randomUUID(),
      ...org,
      createdAt: new Date().toISOString(),
      verified: false
    };
    this.organizations.push(organization);
    return organization;
  }

  findOrganizationByEmail(email) {
    return this.organizations.find(org => org.email === email);
  }

  findOrganizationById(id) {
    return this.organizations.find(org => org.id === id);
  }

  getAllOrganizations() {
    return this.organizations.map(({ password, ...org }) => org);
  }

  // Report methods
  createReport(report) {
    const newReport = {
      id: crypto.randomUUID(),
      ...report,
      status: 'pending',
      isAnonymous: true,
      synced: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reports.push(newReport);
    return newReport;
  }

  getReportsByOrganization(organizationId) {
    return this.reports
      .filter(report => report.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findReportById(id) {
    return this.reports.find(report => report.id === id);
  }

  updateReport(id, updates) {
    const index = this.reports.findIndex(report => report.id === id);
    if (index === -1) return null;

    this.reports[index] = {
      ...this.reports[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.reports[index];
  }

  getAllReports() {
    return this.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const db = new Database();
