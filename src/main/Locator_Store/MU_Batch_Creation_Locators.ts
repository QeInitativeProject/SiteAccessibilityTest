import type { FrameLocator, Locator, Page } from '@playwright/test';

export class MU_Batch_Creation_Locators {
  // Pre-login locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  // Post-login locators
  readonly atiLogo: Locator;
  readonly systemAdministrationText: Locator;
  readonly personnelHomeText: Locator;
  readonly welcomeMessage: Locator;

  // Navigation locators
  readonly systemAdministrationMenu: Locator;
  readonly manageUtilityOption: Locator;

  // Manage Utility specific elements
  readonly manageConsortiums: Locator;
  readonly manageInstitutions: Locator;
  readonly manageCohorts: Locator;
  readonly manageSemester: Locator;
  readonly manageAssessments: Locator;
  readonly manageUsers: Locator;
  readonly manageTEAS: Locator;
  readonly trackingBatches: Locator;

  // Table/cell locators
  readonly manageAssessmentsCell: Locator;
  readonly assessmentInformationDetailsCell: Locator;

  // Iframe and button locators
  readonly assessmentsIframe: Locator;
  readonly assessmentsFrameLocator: FrameLocator;
  readonly addNewAssessmentButton: Locator;

  // Dropdown locators
  readonly assessmentDropdown: Locator;
  readonly institutionDropdown: Locator;

  // Textbox locators
  readonly paidBookletsTextbox: Locator;
  readonly passwordTextbox: Locator; // Added by Shyan for password entry

  // Expected names for utilities
  static readonly expectedManageUtilities = [
    'Manage Consortiums',
    'Manage Institutions',
    'Manage Cohorts',
    'Manage Semester',
    'Manage Assessments',
    'Manage Users',
    'Manage TEAS',
    'Tracking Batches',
  ];

  constructor(page: Page) {
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.locator('button[type="submit"]');

    this.atiLogo = page.locator('[alt*="ATI"], img[src*="ati"], .logo').first();
    this.systemAdministrationText = page.getByText('SYSTEM ADMINISTRATION');
    this.personnelHomeText = page.getByText('ATI Personnel Home');
    this.welcomeMessage = page.locator('text=Welcome');

    this.systemAdministrationMenu = page.locator('text=System Administration');
    this.manageUtilityOption = page.getByRole('link', { name: 'Management Utility' });

    this.manageConsortiums = page.getByRole('link', { name: 'Manage Consortiums' });
    this.manageInstitutions = page.getByRole('link', { name: 'Manage Institutions' });
    this.manageCohorts = page.getByRole('link', { name: 'Manage Cohorts' });
    this.manageSemester = page.getByRole('link', { name: 'Manage Semester' });
    this.manageAssessments = page.getByRole('link', { name: 'Manage Assessments' });
    this.manageUsers = page.getByRole('link', { name: 'Manage Users' });
    this.manageTEAS = page.getByRole('link', { name: 'Manage TEAS' });
    this.trackingBatches = page.getByRole('link', { name: 'Tracking Batches' });

    this.manageAssessmentsCell = page
      .getByRole('cell', { name: 'Manage Assessments', exact: true })
      .nth(1);
    this.assessmentInformationDetailsCell = page.getByRole('cell', {
      name: 'Assessment Information Details',
      exact: true,
    });

    // Iframe and Add New Assessment button
    this.assessmentsIframe = page.locator('#ctl00_CPHolder_assessmentsIframe');
    this.assessmentsFrameLocator = page.frameLocator('#ctl00_CPHolder_assessmentsIframe');
    this.addNewAssessmentButton = this.assessmentsFrameLocator.getByRole('button', {
      name: 'Add New Assessment',
    });

    // Dropdown locators
    this.assessmentDropdown = page.locator('#ctl00_CPHolder_ddlAssessment');
    this.institutionDropdown = page.locator('#ctl00_CPHolder_ddlInstitution');

    // Textbox locators
    this.paidBookletsTextbox = page.locator('#ctl00_CPHolder_txtPaidBooklets');
    this.passwordTextbox = page.locator('#ctl00_CPHolder_txtPassword'); // Added by Shyan for password entry
  }
}
