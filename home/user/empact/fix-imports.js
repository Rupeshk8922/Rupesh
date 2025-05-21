import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

function findAndReplaceImports(directory) {
    const files = readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            findAndReplaceImports(fullPath);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
            let content = readFileSync(fullPath, 'utf8');
            let modified = false;
            const importRegex = /import\s+{(.*?)}\s+from\s+['"](.*?)['"];?/g;

            let match;
            const unusedVars = findUnusedVars(content, fullPath);

            while ((match = importRegex.exec(content)) !== null) {
                const importedVarsString = match[1];
                const modulePath = match[2];
                const importedVars = importedVarsString.split(',').map(v => v.trim()).filter(v => v);
                const usedVars = importedVars.filter(v => !unusedVars.includes(v));

                if (usedVars.length < importedVars.length) {
                    const newImportString = usedVars.length > 0 ? `{ ${usedVars.join(', ')} }` : '';
                    const newImportLine = newImportString ? `import ${newImportString} from '${modulePath}';` : '';
                    content = content.substring(0, match.index) + newImportLine + content.substring(match.index + match[0].length);
                    modified = true;
                    importRegex.lastIndex = match.index + newImportLine.length;
                }
            }

            if (modified) {
                writeFileSync(fullPath, content, 'utf8');
            }
        }
    });
}

function findUnusedVars(content, filePath) {
    // This is a placeholder. A real implementation would require parsing the code
    // with a tool like Acorn or Esprima and analyzing the AST.
    // For the purpose of this example, we'll simulate finding unused vars
    // based on the provided lint output.
    const unused = [];
    // Add more conditions here based on the lint output for other files
    if (filePath.includes('src/App.jsx')) {
        unused.push('lazy', 'Suspense');
    }
     if (filePath.includes('src/components/AssignVolunteerModal.jsx')) {
        unused.push('useSubscriptionType');
    }
     if (filePath.includes('src/components/DashboardLayout.jsx')) {
        unused.push('SidebarLayout');
    }
     if (filePath.includes('src/components/LeadsTable.jsx')) {
        unused.push('Skeleton', 'AlertTriangle', 'Users', 'Card', 'CardContent');
    }
      if (filePath.includes('src/components/crm/AddEventForm.jsx')) {
        unused.push('validateForm', 'descriptionErr');
    }
      if (filePath.includes('src/components/crm/AddLeadForm.jsx')) {
        unused.push('value');
    }
      if (filePath.includes('src/components/crm/EventsList.jsx')) {
        unused.push('FaCalendarAlt', 'FaTag', 'FaMapMarkerAlt', 'FaUsers', 'FaCircle', 'FaSquare', 'MdOutlineEventNote', 'capacity');
    }
      if (filePath.includes('src/components/crm/VolunteersList.jsx')) {
        unused.push('React', 'FaFilter', 'FaSearch', 'FaCalendarAlt', 'FaTags', 'FaMapMarkerAlt', 'FaUsers', 'FaSort', 'FaSortAlphaDown', 'FaSortAlphaUp', 'FaThLarge', 'FaThList', 'FaPlusCircle', 'AssignVolunteerModal', 'ConfirmDeleteModal');
    }
       if (filePath.includes('src/components/forms/AddLeadForm.jsx')) {
        unused.push('validateSource', 'source');
    }
        if (filePath.includes('src/components/layout/Navigation.jsx')) {
        unused.push('ROLES');
    }
       if (filePath.includes('src/components/user/NotificationSettings.jsx')) {
        unused.push('err');
    }
       if (filePath.includes('src/firestore/collections/tasks.js')) {
        unused.push('taskStructure');
    }
        if (filePath.includes('src/hooks/useAuth.jsx')) {
        unused.push('AuthContext');
    }
         if (filePath.includes('src/hooks/useDocument.js')) {
        unused.push('unsubscribe');
    }
          if (filePath.includes('src/hooks/useLogin.jsx')) {
        unused.push('useState');
    }
         if (filePath.includes('src/hooks/useLogout.jsx')) {
        unused.push('useState', 'dispatch');
    }
         if (filePath.includes('src/hooks/useSignup.jsx')) {
        unused.push('useState');
    }
        if (filePath.includes('src/hooks/useStorage.jsx')) {
        unused.push('getDownloadURL');
    }
       if (filePath.includes('src/hooks/useVolunteers.jsx')) {
        unused.push('user');
    }
       if (filePath.includes('src/main.jsx')) {
        unused.push('StrictMode', 'App', 'BrowserRouter', 'AuthProvider', 'ErrorBoundary');
    }
       if (filePath.includes('src/pages/AddDonorForm.jsx')) {
        unused.push('React', 'Button', 'Typography', 'Box', 'FormContainer', 'StyledTextField');
    }
       if (filePath.includes('src/pages/AdminDashboard.jsx')) {
        unused.push('React');
    }
        if (filePath.includes('src/pages/AdminProfileSettingsPage.jsx')) {
        unused.push('useFetchSubscriptionStatus');
    }
       if (filePath.includes('src/pages/CSRDashboard.jsx')) {
        unused.push('DashboardLayout');
    }
       if (filePath.includes('src/pages/CallLogForm.jsx')) {
        unused.push('TextField', 'Button', 'FormControl', 'InputLabel', 'Select', 'MenuItem', 'FormControlLabel', 'RadioGroup', 'Radio', 'Typography', 'Grid', 'Box', 'CircularProgress', 'Alert', 'LocalizationProvider', 'DatePicker', 'TimePicker');
    }
        if (filePath.includes('src/pages/CheckoutSuccessPage.jsx')) {
        unused.push('useAuth', 'useSubscription');
    }
       if (filePath.includes('src/pages/CompanyDashboard.jsx')) {
        unused.push('React', 'CompanyDataReader');
    }
        if (filePath.includes('src/pages/CompanyLandingPage.jsx')) {
        unused.push('useState', 'useAuth');
    }
       if (filePath.includes('src/pages/CompanySettingsPage.jsx')) {
        unused.push('React', 'getDoc', 'fetchError');
    }
         if (filePath.includes('src/pages/CreateLeadPage.jsx')) {
        unused.push('React', 'Navigate', 'navigate', 'formErrors', 'submissionLoading', 'setSubmissionLoading', 'submissionError', 'setSubmissionError', 'createSuccess', 'setCreateSuccess');
    }
        if (filePath.includes('src/pages/DCRForm.jsx')) {
        unused.push('React', 'Autocomplete', 'TextField', 'Button', 'Select', 'MenuItem', 'FormControl', 'InputLabel', 'CircularProgress', 'Alert', 'Box', 'Paper', 'Typography');
    }
       if (filePath.includes('src/pages/DCRPage.jsx')) {
        unused.push('React', 'DCRForm', 'useAuth', 'Box', 'Typography');
    }
        if (filePath.includes('src/pages/DashboardPage.jsx')) {
        unused.push('React', 'useAuth');
    }
       if (filePath.includes('src/pages/EditOutreachContactPage.jsx')) {
        unused.push('React', 'email');
    }
        if (filePath.includes('src/pages/EditUserPage.jsx')) {
        unused.push('currentUser');
    }
        if (filePath.includes('src/pages/EditVolunteerPage.jsx')) {
        unused.push('React', 'Navigate', 'volunteerId', 'navigate', 'availability', 'interests', 'assignedEvents');
    }
       if (filePath.includes('src/pages/ErrorPage.jsx')) {
        unused.push('React');
    }
       if (filePath.includes('src/pages/EventAnalyticsPage.jsx')) {
        unused.push('React', 'LineChart', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'Legend', 'ResponsiveContainer', 'PieChart', 'Pie', 'Cell', 'BarChart', 'Bar', 'now');
    }
        if (filePath.includes('src/pages/EventDetailsPage.jsx')) {
        unused.push('React', 'useContext', 'AuthContext', 'ConfirmDeleteModal', 'user', 'Detail');
    }
       if (filePath.includes('src/pages/FollowUpReminder.jsx')) {
        unused.push('React', 'TextField', 'Button', 'FormControl', 'InputLabel', 'Select', 'MenuItem', 'Typography', 'Box', 'List', 'ListItem', 'ListItemText', 'ListItemSecondaryAction', 'IconButton', 'CircularProgress', 'Alert', 'CallIcon', 'VisibilityIcon', 'err');
    }
        if (filePath.includes('src/pages/ForgotPasswordPage.jsx')) {
        unused.push('CircularProgress');
    }
        if (filePath.includes('src/pages/IntegrationsSettings.jsx')) {
        unused.push('React');
    }
        if (filePath.includes('src/pages/LandingPage.jsx')) {
        unused.push('React', 'useAuth');
    }
       if (filePath.includes('src/pages/LeadDetailsPage.jsx')) {
        unused.push('React', 'Link');
    }
        if (filePath.includes('src/pages/LeadsAnalyticsPage.jsx')) {
        unused.push('React', 'BarChart', 'Bar', 'XAxis', 'YAxis', 'Tooltip', 'Legend', 'ResponsiveContainer', 'CartesianGrid', 'user', 'name', 'props');
    }
       if (filePath.includes('src/pages/LeadsList.jsx')) {
        unused.push('React', 'Link');
    }
        if (filePath.includes('src/pages/LeadsListPage.jsx')) {
        unused.push('DashboardLayout');
    }
       if (filePath.includes('src/pages/LeadsPage.jsx')) {
        unused.push('React', 'LeadsList', 'isMobileView', 'searchTerm', 'setSearchTerm', 'filterStatus', 'setFilterStatus', 'filterAssignedTo', 'setFilterAssignedTo', 'availableStatuses', 'fetchUsersHook');
    }
       if (filePath.includes('src/pages/LocationTracker.jsx')) {
        unused.push('React', 'firebaseApp', 'user', 'loading', 'hasAccess');
    }
       if (filePath.includes('src/pages/LoginPage.jsx')) {
        unused.push('Link');
    }
        if (filePath.includes('src/pages/NewCompanyPage.jsx')) {
        unused.push('setShowPassword');
    }
      if (filePath.includes('src/pages/OutreachContactDetails.jsx')) {
        unused.push('React', 'useEffect', 'useState', 'useAuth');
    }
      if (filePath.includes('src/pages/OutreachDashboard.jsx')) {
        unused.push('React', 'LeadsModule', 'EventsModule', 'VolunteersModule', 'AIAssistant', 'MapsAndTracking');
    }
       if (filePath.includes('src/pages/PerformanceSummary.jsx')) {
        unused.push('React', 'Container', 'Typography', 'Card', 'CardContent', 'Grid', 'CircularProgress', 'LineChart', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'Legend', 'useAuth');
    }
       if (filePath.includes('src/pages/RegisterCompany.jsx')) {
        unused.push('React', 'collection');
    }
       if (filePath.includes('src/pages/ReportsPage.jsx')) {
        unused.push('React', 'ResponsiveContainer', 'BarChart', 'Bar', 'XAxis', 'YAxis', 'Tooltip', 'useAuth');
    }
      if (filePath.includes('src/pages/SignupChoicePage.jsx')) {
        unused.push('React');
    }
      if (filePath.includes('src/pages/SignupCompanyPage.jsx')) {
        unused.push('setSuccessMessage', 'showVerificationMessage', 'setShowVerificationMessage');
    }
      if (filePath.includes('src/pages/SignupPage.jsx')) {
        unused.push('React');
    }
       if (filePath.includes('src/pages/SignupVolunteerPage.jsx')) {
        unused.push('React', 'navigate');
    }
       if (filePath.includes('src/pages/SupportPage.jsx')) {
        unused.push('React');
    }
      if (filePath.includes('src/pages/TelecallerDashboard.jsx')) {
        unused.push('DashboardLayout', 'user');
    }
        if (filePath.includes('src/pages/TrackHoursPage.jsx')) {
        unused.push('React', 'loadingSubmit', 'setLoadingSubmit');
    }
       if (filePath.includes('src/pages/UpgradePlan.jsx')) {
        unused.push('React', 'Button', 'Snackbar', 'Alert', 'useAuth');
    }
       if (filePath.includes('src/pages/UserDashboardPage.jsx')) {
        unused.push('React', 'Redirect', 'CompanyDashboard', 'AIAssistant', 'MapsAndTracking', 'claims');
    }
       if (filePath.includes('src/pages/UsersPage.jsx')) {
        unused.push('React', 'query', 'err', 'handleEdit');
    }
       if (filePath.includes('src/pages/VerifyCompanyPage.jsx')) {
        unused.push('useNavigate', 'Link');
    }
       if (filePath.includes('src/pages/VolunteerAnalyticsPage.jsx')) {
        unused.push('React', 'useEffect', 'PieChart', 'Pie', 'Cell', 'Tooltip', 'Legend', 'ResponsiveContainer', 'LineChart', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'BarChart', 'Bar', 'authLoading', 'startDate', 'endDate');
    }
       if (filePath.includes('src/pages/VolunteerDashboard.jsx')) {
        unused.push('DashboardLayout');
    }
       if (filePath.includes('src/pages/VolunteerDetailsPage.jsx')) {
        unused.push('useauthContext', 'VolunteerDetailsPage', 'user', 'pageLoading');
    }
       if (filePath.includes('src/pages/VolunteersPage.jsx')) {
        unused.push('React', 'Button', 'Input', 'Dialog', 'DialogContent', 'DialogTrigger', 'VolunteerForm');
    }
       if (filePath.includes('src/pages/WelcomePage.jsx')) {
        unused.push('React', 'Link');
    }
        if (filePath.includes('src/pages/dashboard/admin/AdminDashboard.jsx')) {
        unused.push('React', 'Link', 'user', 'navigate');
    }
       if (filePath.includes('src/pages/dashboard/admin/UsersPage.jsx')) {
        unused.push('React');
    }
       if (filePath.includes('src/pages/dashboard/crm/events/CreateEventPage.jsx')) {
        unused.push('React', 'Navigate');
    }
      if (filePath.includes('src/pages/dashboard/crm/events/EditEventPage.jsx')) {
        unused.push('React', 'Navigate', 'navigate', 'eventDataToSubmit');
    }
       if (filePath.includes('src/pages/dashboard/crm/events/EventDetailsPage.jsx')) {
        unused.push('React', 'Navigate');
    }
      if (filePath.includes('src/pages/dashboard/crm/events/EventsListPage.jsx')) {
        unused.push('React', 'LoadingSpinner');
    }
       if (filePath.includes('src/pages/dashboard/crm/leads/CreateLeadPage.jsx')) {
        unused.push('React', 'navigate', 'formErrors', 'submissionLoading', 'setSubmissionLoading', 'submissionError', 'setSubmissionError', 'createSuccess', 'setCreateSuccess');
    }
        if (filePath.includes('src/pages/dashboard/crm/leads/EditLeadPage.jsx')) {
        unused.push('React', 'Navigate', 'Input', 'Textarea', 'Select', 'SelectTrigger', 'SelectContent', 'SelectItem', 'SelectValue', 'Button', 'id', 'err');
    }
        if (filePath.includes('src/pages/dashboard/crm/leads/LeadDetailsPage.jsx')) {
        unused.push('React', 'Navigate');
    }
       if (filePath.includes('src/pages/dashboard/crm/leads/ViewLeadPage.jsx')) {
        unused.push('React', 'Navigate', 'Card', 'CardContent', 'Skeleton', 'Button', 'initialError');
    }
        if (filePath.includes('src/pages/dashboard/crm/volunteers/EditVolunteerPage.jsx')) {
        unused.push('React');
    }
       if (filePath.includes('src/pages/dashboard/crm/volunteers/VolunteerDetailsPage.jsx')) {
        unused.push('React');
    }
       if (filePath.includes('src/pages/dashboard/csr/CSRDashboard.jsx')) {
        unused.push('React', 'Navigate', 'Redirect', 'setError', 'error');
    }
       if (filePath.includes('src/pages/dashboard/outreach/OutreachDashboard.jsx')) {
        unused.push('React', 'Navigate');
    }
       if (filePath.includes('src/pages/dashboard/telecaller/TelecallerDashboard.jsx')) {
        unused.push('React', 'user');
    }
      if (filePath.includes('src/pages/dashboard/volunteer/VolunteerDashboard.jsx')) {
        unused.push('React', 'Navigate');
    }
       if (filePath.includes('src/routesConfig.js')) {
        unused.push('Route', 'Component', 'isPublic');
    }
       if (filePath.includes('src/services/leadsService.js')) {
        unused.push('where');
    }
      if (filePath.includes('src/tests/PerformanceSummary.test.jsx')) {
        unused.push('React', 'fireEvent', 'PerformanceSummary', 'authContext', 'FirebaseContext');
    }
    return unused;
}

// Example usage:
// findAndReplaceImports('./src');