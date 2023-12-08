export default {
  messages: {
    success: {
      default: 'Success'
    },
    error: {
      default: 'Error - Something went wrong',
      schedulesWrongFormat: 'Please provide file with %format extension'
    },
    delete: 'Are you sure you want to delete this item?'
  },
  tenants: {
    navigationTitle: 'Tenants',
    searchLabel: 'Search tenants by name...',
    requestNewTenant: 'Request New Tenant',
    welcomeMsg: 'Welcome to your tenants',
    selectTenantsMsg: 'Select tenants to access the projects',
    addNewTenant: 'Tenant %name successfully created'
  },
  systemRoles: {},
  workspaces: {
    navigationTitle: 'Workspaces',
    searchLabel: 'Search workspaces by name...',
    welcomeMsg: 'Welcome to your workspaces',
    create: 'Create New Workspace',
    deleteWorkspace: 'Delete workspace',
    new: {
      title: 'Project workspace create',
      success: 'Workspace created'
    },
    edit: {
      title: 'Project workspace edit',
      success: 'Workspace edited'
    },
    delete: {
      text: 'Are you sure you want to delete this workspace?',
      success: 'Workspace deleted'
    },
    settings: {
      navigationTitle: 'Workspace Administration',
      userManagement: {
        navigationTitle: 'User Administration',
        title: 'User Administration',
        addNewUser: 'Add New User',
        workspaceUsers: 'Workspace Users',
        name: 'Name',
        email: 'Email',
        role: 'Role',
        deleteDialogText: 'Are you sure you want to delete this member?',
        deleteSuccess: 'User %user successfully deleted',
        addNewMember: 'Add new member',
        editMember: 'Edit member',
        deleteMember: 'Delete member',
        selectRole: 'Select role',
        addNewUserSuccess: 'User %name successfully added',
        editUserSuccess: 'User %name successfully updated'
      },
      rolesManagement: {
        navigationTitle: 'Roles Administration',
        createNewRole: 'Add New Role',
        roles: 'Roles',
        title: 'Roles Administration',
        role: 'Role',
        permissions: 'Permissions',
        delete: 'Delete Role',
        deleteSuccess: 'Role %role successfully deleted',
        deleteDialogText: 'Are you sure you want to delete this role?',
        newRole: 'New Role',
        roleName: 'Role Name',
        addNewRoleSuccess: 'Role %name successfully added',
        editRoleSuccess: 'Role %name successfully updated',
        editRole: 'Edit Role',
        selectPermissions: 'Select permissions',
        adminAccess: 'Administration access',
        workspaceAccess: 'Workspace access',
        scheduleAccess: 'Schedule access',
        financialAccess: 'Financial access'
      }
    },
    schedules: {
      navigationTitle: 'Schedules',
      welcomeMsg: 'Welcome to your schedules',
      searchLabel: 'Search schedules by name',
      manageSchedule: 'Manage Schedule',
      management: {
        group : {
          title: 'Manage Group'
        },
        activityCodesOf: 'Activity Codes Of',
        title: 'Schedules management',
        navigationTitle: 'Management',
        groupsSelectLabel: 'Group',
        groupsSelectPlaceholder: 'Select group',
        assignToGroup: 'Assign to a Group',
        assignSchedule: 'Assign Schedules',
        assignedToGroupSuccess: 'Schedule assigned successfully',
        upload: {
          success: 'File uploaded'
        },
        delete: {
          title: 'Are you sure you want to remove this version?',
          text: 'By deleting a schedule, this will also delete it from all schedule groups',
          success: 'Version deleted'
        },
        publish: {
          success: 'Layout published'
        },
        save: {
          title:'Publish Action Required',
          text:"The schedule update for this group has been saved, but the changes are not live yet. To make the layout visible to the group, please click 'Publish' now."
        }
      },
      gantt: {
        title: 'Schedules Gantt',
        searchLabel: 'Search Gantt Chart',
        toggleDependencyLines: 'Toggle relationship lines',
        quickFilters: 'Quick Filters',
        scheduleGroups: 'Schedule Groups',
        filters: {
          tabs: {
            one: 'General',
            two: 'WBS',
            three: 'Activity codes'
          },
          status: 'Activity status',
          clearAllTooltip: 'Clear all filters'
        }
      },
      groups: {
        title: 'Schedules groups',
        navigationTitle: 'Groups',
        fields: {
          name: 'Name'
        },
        manageGroup: 'Manage Group',
        delete: {
          text: 'Are you sure you want to delete this group?',
          success: 'Group deleted'
        },
        new: {
          title: 'Create a new group',
          label: 'Create New Schedule Group',
          success: 'Group created'
        },
        edit: {
          title: 'Edit group',
          success: 'Group edited'
        },
        users: {
          navigationTitle: 'Users',
          title: 'Manage users',
          searchLabel: 'Search users by email',
          remove: {
            title: 'Delete member',
            text: 'Are you sure you want to remove this member?',
            success: 'Member removed'
          },
          add: {
            text: 'Add member',
            success: 'Member added'
          }
        }
      }
    },
    financials: {
      navigationTitle: 'Financials',
      transactions: {
        navigationTitle: 'Transactions',
        title: 'Transactions',
        addNewTransaction: 'Add New Transaction',
        tableSubtitle: 'Updates on cost changes, original budget',
        selectColumns: 'Select Columns',
        addDialogTitle: 'Add New Transaction',
        transactionId: 'Transaction ID',
        phase: 'Phase',
        category: 'Category',
        financialType: 'Financial Type',
        description: 'Description',
        amount: 'Amount',
        effectiveDate: 'Effective Date',
        status: 'Status',
        assignedDate: 'Assigned Date',
        assignedBy: 'Assigned By',
        assignedComment: 'Comment',
        statusHistory: 'Status History',
        transactionDetails: 'Transaction details',
        transaction: 'Transaction',
        updatedAt: 'Updated At',
        updatedBy: 'Updated By',
        comment: 'Comment',
        addNewTransactionSuccess: 'Transaction %custom_id successfully added',
        editTransactionSuccess: 'Transaction %custom_id successfully updated',
        deleteTransactionSuccess: 'Transaction %custom_id successfully discarded',
        discardDialogTitle: 'Discard Transaction',
        discardTransaction: 'Are you sure you want to discard this transaction?',
        updateMultipleStatusConfirmation:
            'You will change a status on a %selected_transactions transactions. Do you want to continue?',
        importSuccess: 'File has been successfully uploaded',
        updateSuccess: '%selected_transactions transaction/s updated successfully',
        changeStatusTo: 'Change status to',
        changeStatus: 'Change status',
        fields: {
          transactionId: 'Transaction ID',
          phase: 'Phase',
          financialType: 'Financial Type',
          category: 'Category',
          status: 'Status',
          amount: 'Amount',
          statusComment: 'Status Comment',
          description: 'Description',
          assignedDate: 'Assigned Date',
          assignedBy: 'Assigned By',
          effectiveDate: 'Effective Date',
          updatedBy: 'Updated By',
          updatedAt: 'Updated At'
        }
      },
      dashboard: {
        navigationTitle: 'Dashboard',
        costSheetTitle: 'Cost Sheet',
        costTableTitle: 'Cost Table',
        costSheetSubTitle: 'Total costs for each phase of the project.',
        costTableSubTitle: 'Showing distributed financial data for selected phases and categories.',
        cards: {
          costImpact: 'Budget Impact',
          originalBudget: 'Original Budget',
          currentBudget: 'Current Budget',
          proposedBudget: 'Proposed Budget',
          actualCost: 'Actual Cost',
          remainingCost: 'Remaining Cost',
          atCompletionCost: 'At Completion Cost',
          revenue: 'Revenue',
          margin: 'Margin',
          marginPercent: 'Margin %',
          actualApprovedCost: 'Current Budget',
          pendingActualCost: 'Proposed Budget'
        },
        tables: {
          financialTypeView: 'Financial Category View',
          projectPhaseView: 'Project Phase View',
          costGraph: 'Cost Graph',
          financialCategory: 'Financial Category'
        }
      },
      original: {
        navigationTitle: 'Original Budget',
        title: 'Original Budget',
        newBudget: 'New Original Budget',
        currentBudget: 'Current Original Budget',
        totalRemaining: 'Total Original Budget',
        successSaveAsDraft: 'Successfully saved as draft current budget.',
        differenceValidationTitle: 'Distribution Discrepancy',
        differenceValidationText: 'Please ensure the "Total Original Budget" equals the "Distributed" amount and the "Difference" is 0 to save the distribution.',
        successSaveAsCurrent: 'Successfully saved as current budget.',
        clearQuestion: 'Are you sure you want to clear all categories data from new original budget?',
        restoreQuestion: 'Are you sure you want to restore data from current original budget? All the data in new original budget will be removed!',
        saveAsCurrentQuestion: 'Are you sure you want to save as current original budget?',
        saveAsDraftQuestion: 'Are you sure you want to save as draft original budget?',
        distributeQuestion: 'Distribute Original budget',
        distributeText: 'The Total Original Budget will be evenly distributed across the time scale of selected categories, overwriting any manual distribution made on the time scale.',
        historySubTitle: 'Previous updates in the original budget',
        noPhasesText: ' You have no phases created for this project. Please go back and create project phases to be able to enter the Original Budget per phase.',
        noPhasesTitle: 'Project Phases Required',
      },
      remaining: {
        navigationTitle: 'Remaining Cost',
        title: 'Remaining Cost',
        selectPhase: 'Select Phase',
        showHistory: 'Show History',
        showData: 'Show Data',
        remainingCostsTableTitle: 'Remaining Costs Table Construction',
        historyTitle: 'History',
        historySubTitle: 'Previous updates in the remaining costs',
        date: 'Date',
        totalRemaining: 'Total Remaining Cost',
        difference: 'Difference',
        distributed: 'Distributed',
        monthly: 'Monthly',
        quaterly: 'Quaterly',
        yearly: 'Yearly',
        noPhasesText: 'You have no phases created for this project. Please go back and create project phases to be able to enter the Remaining Cost per phase.',
        noPhasesTitle: 'Project Phases Required ',
        noData: 'There is no data for selected phase.',
        selectCategory: 'Select Category',
        currentRemaining: 'Current Remaining Cost',
        newRemaining: 'New Remaining Cost',
        distributeValidation: 'Distributed cannot be greater than Total Remainings',
        differenceValidationTitle: 'Distribution Discrepancy',
        differenceValidationText: 'Please ensure the "Total Remaining Cost" equals the "Distributed" amount and the "Difference" is 0 to save the distribution. ',
        emptyField: 'Please enter data to save as current.',
        selectCategoryRequired: 'Category selection required',
        selectCategoryRequiredText: 'Before distributing, please check the checkboxes next to the categories you want to distribute on.',
        successSaveAsCurrent: 'Successfully saved as current remaining.',
        successSaveAsDraft: 'Successfully saved as draft current remaining.',
        clearQuestion: 'Are you sure you want to clear all categories data from new remaining cost?',
        restoreQuestion: 'Are you sure you want to restore data from current remaining? All the data in new remaining cost will be removed!',
        saveAsCurrentQuestion: 'Are you sure you want to save as current remaining?',
        saveAsDraftQuestion: 'Are you sure you want to save as draft remaining?',
        distributeQuestion: 'Distribute Remaining Cost',
        distributeText: 'The Total Remaining Cost will be evenly distributed across the time scale of selected categories, overwriting any manual distribution made on the time scale.',
        removeCategory: 'Once removed, all the data of this row will be removed.',
        costType: 'Financial Type',
        actions: {
          distribute: 'Distribute',
          saveAsDraft: 'Save as Draft',
          saveAsCurrent: 'Save as Current',
          restoreCurrent: 'Restore Current',
          clear: 'Clear',
          removeCategory: 'Remove Category'
        }
      }
    }
  },
  projectStatus: {
    navigationTitle: 'Project Card',
    overview: 'Overview',
    phaseGate: {
      navigationTitle: 'Project Phases & Tollgates ',
      title: 'Project Phases & Tollgates ',
      phase: {
        label: 'Phase | Phases',
        addNew: 'Add New Phase',
        editTitle: 'Edit phase',
        addSuccess: 'Phase added',
        editSuccess: 'Phase edited',
        deleteTitle: 'Delete phase',
        deleteText: 'Are you sure you want to delete this item?',
        deleteSuccess: 'Phase deleted',
        textConfirmation: 'Changing the start and end dates of this phase will impact transactions with "Pending" and "Approved" statuses within that phase.',
        deleteWarningTitle:"Required Actions Before Deleting Phase ",
        deleteWarningText:"Before deletion, please discard all 'Approved' and 'Pending' transactions for this phase, and reset both 'Remaining Cost' and 'Original Budget' for this phase to zero.",
      },
      gate: {
        label: 'Tollgate | Tollgates',
        addNew: 'Add New Tollgate',
        editTitle: 'Edit tollgate',
        addSuccess: 'Tollgate added',
        editSuccess: 'Tollgate edited',
        deleteTitle: 'Delete tollgate',
        deleteText: 'Are you sure you want to delete this item?',
        deleteSuccess: 'Tollgate deleted'
      },
      status: {
        notStarted: 'Not Started',
        inProgress: 'In Progress',
        completed: 'Completed'
      },
      fields: {
        status: 'Status',
        comment: 'Comment',
        lane: 'Row',
        name: 'Name',
        start_date: 'Start date',
        end_date: 'Finish date',
        cost_budget: 'Budget cost',
        cost_actual: 'Actual cost',
        hours_budget: 'Budget hours',
        hours_actual: 'Actual hours',
        remaining_hours: 'Remaining hours',
        remaining_cost: 'Remaining cost',
        custom_id: 'Custom ID',
        phase_id: 'Phase ID'
      }
    },
    facts: {
      navigationTitle: 'Project Facts',
      title: 'Project Facts',
      subtitle: 'Latest update ...',
      searchLabel: 'Search facts by name...',
      addNew: 'Add New Fact',
      addNewTitle: 'Add fact to the project',
      editTitle: 'Enter %type',
      removeTitle: 'Remove fact',
      removeText: 'Are you sure you want to remove fact?',
      removeSuccess: 'You have successfully %operation preview card',
      removed: 'removed from',
      added: 'added to',
      previewTitle: 'Facts preview',
      fields: {
        custom_id: 'Id',
        shown_in_card: 'Show/Hide',
        name: 'Name',
        value: 'Value'
      },
      edit: {
        success: 'Fact edited'
      },
      remove: {
        success: 'Fact removed'
      },
      add: {
        success: 'Fact added'
      }
    },
    information: {
      navigationTitle: 'Project Information',
      title: 'Project Information',
      subtitle: 'Latest project status, goals and objectives',
      currentGoal: 'Goals and Objectives',
      currentStatus: 'Status',
      objectives: {
        addNew: 'Add New Goals And Objectives',
        addTitle: 'Add new goals and objectives',
        addNewSuccess: 'Goals and objectives added',
        editTitle: 'Edit goals and objectives',
        editSuccess: 'Goals and objectives edited',
        deleteTitle: 'Delete goals and objectives',
        deleteText: 'Are you sure you want to delete this item?',
        deleteSuccess: 'Goals and objectives deleted'
      },
      informationStatus: {
        addNew: 'Add New Status',
        addTitle: 'Add new status',
        addNewSuccess: 'Status added',
        editTitle: 'Edit status',
        editSuccess: 'Status edited',
        deleteTitle: 'Delete status',
        deleteText: 'Are you sure you want to delete this item?',
        deleteSuccess: 'Status deleted'
      },
      fields: {
        date: 'Date',
        shown_in_card: 'Show/Hide',
        description: 'Description'
      }
    },
    kpi: {
      navigationTitle: "Project KPIs",
      title: "Project KPIs",
      switchToKpi: 'KPI Graph',
      addRemoveBtn: "Manage KPIs",
      previewTitle: "KPIs preview",
      fields: {
        kpi_name: 'KPI Name',
        kpi_graph: 'KPI Graph',
        shown_in_card: 'Show / Hide',
        threshold_levels: 'Threshold Levels',
        use: 'Use',
        description: 'Description',
        report_date: 'Report Date',
        report_value: 'Value',
        report_comment: 'Comment',
        reponsible_action: 'Responsible for actions'
      },
      delete: {
        text: 'Are you sure you want to delete this KPI?',
        success: 'KPI deleted'
      },
      report: {
        new: {
          title: 'Add report',
          success: 'Report value created'
        },
        edit: {
          title: 'Edit report',
          success: 'Report edited'
        },
        delete: {
          text: 'Are you sure you want to delete this KPI value?',
          success: 'KPI value deleted'
        }
      },
      dialog: {
        kpiList: 'KPI List',
        searchKpis: "Search KPI's by Name...",
        chooseKpiText: "Choose which KPI's you want to use in the project",
        delete: 'Delete KPI',
        deleteText: 'Are you sure you want to delete this KPI?',
        deleteSuccess: 'KPI %custom_id successfully deleted',
        kpiReports: 'KPI reports',
        clientRelationship: 'Client Relationship',
        addNewReport: 'Add New Report',
        editReport: 'Edit KPI report',
        deleteKpiValue: 'Delete KPI Value',
        deleteTextKpiValue: 'Are you sure you want to delete this KPI Value?',
        score: 'Score',
        on: 'On',
        deleteSuccessKpiValue: 'KPI value - Date: %date Score: %score successfully deleted',
        createNewReportSuccess: 'New Report value successfully created',
        editKpiReportSuccess: 'KPI Report successfully updated',
        editKpiProjectSuccess: 'KPI Project successfully updated',
        deleteKpiWarningTitle: 'KPI Data and Reports Loss',
        deleteKpiWarningMsg: 'Unselecting this KPI will result in the loss of all associated data and reports.'
      }
    },
    riskAndOpportunities: {
      navigationTitle: 'Project Risks & Opportunities',
      title: 'Project Risks & Opportunities',
      previewTitle: 'Top Risk and Opportunities Preview',
      selectMatrix: 'Select matrix',
      noMatrix: 'Disabled until matrix is selected',
      risk: {
        title: 'Top Risks',
        searchLabel: 'Search risks by description...',
        addNew: 'Add New Risk',
        edit: 'Edit risk',
        delete: 'Delete risk',
        deleteText: 'Are you sure you want to delete this risk?',
        addNewSuccess: 'Risk %custom_id successfully added',
        editSuccess: 'Risk %custom_id successfully edited',
        deleteSuccess: 'Risk %custom_id successfully deleted'
      },
      opportunity: {
        title: 'Top Opportunities',
        searchLabel: 'Search opportunities by description...',
        addNew: 'Add New Opportunity',
        edit: 'Edit opportunity',
        delete: 'Delete opportunity',
        deleteText: 'Are you sure you want to delete this opportunity?',
        deleteSuccess: 'Opportunity %custom_id successfully deleted',
        addNewSuccess: 'Opportunity %custom_id successfully added',
        editSuccess: 'Opportunity %custom_id successfully edited'
      },
      matrixSelect: {
        title: 'Select a matrix',
        text: 'If you change the matrix you will lose all probabilities and severities',
        searchLabel: 'Search matrixes by name...',
        fields: {
          custom_id: 'Id',
          name: 'Name',
          size: 'Size'
        }
      },
      fields: {
        custom_id: 'Id',
        shown_in_card: 'Show/Hide',
        description: 'Description',
        status: 'Status',
        severity: 'Severity',
        probability: 'Probability',
        score: 'Score',
        ownerEmail: 'Owner',
        comment: 'Comment'
      }
    }
  },
  portfolios: {
    navigationTitle: 'Portfolios',
    welcomeMsg: 'Welcome to your portfolios',
    createNew: 'Create New Portfolio',
    searchLabel: 'Search portfolios by name...',
    add: {
      title: 'Create new portfolio',
      success: 'Portfolio created'
    },
    edit: {
      title: 'Edit portfolio',
      success: 'Portfolio edited'
    },
    delete: {
      text: 'Are you sure you want to delete this portfolio?',
      success: 'Portfolio deleted'
    },
    fields: {
      name: 'Portfolio name'
    },
    scoreCard: {
      navigationTitle: 'Score Card',
      selectionTitle: 'Overview',
      phaseView: 'Phase View',
      manageProjects: 'Manage Projects',
      manageProjectsTitle: 'Projects List',
      manageProjectsDesc: 'Choose which project you want to use in this Portfolio.',
      addColumns: 'Manage columns',
      risksAndOpportunities: 'Risks and Opportunities',
      costColumns: 'Financials',
      facts: 'Facts',
      kpis: "KPIs",
      fields: {
        name: 'Project',
        risk_score: 'Risk',
        risk_matrix: 'Risk matrix',
        opportunity_score: 'Opportunity',
        opportunity_matrix: 'Opportunity matrix',
        startDate: 'Start Date',
        endDate: 'End Date',
        use: 'Use',
      }
    },
    userManagement: {
      navigationTitle: 'User Administration',
      addNew:"Add New User",
      add: {
        title: 'Add member',
        success: 'Member added'
      },
      edit: {
        title: 'Edit member',
        success: 'Member edited'
      },
      delete: {
        title: 'Delete member',
        text: 'Are you sure you want to remove this member?',
        success: 'Member removed'
      },
      fields: {
        email: 'E-mail',
        role: 'Role',
        name:'Name',
      }
    }
  },
  administration: {
    navigationTitle: 'Tenant Administration',
    title: 'Tenant Administration',
    facts: {
      navigationTitle: 'Project Facts Register',
      addNew:'Add New Project Fact',
      new: {
        title: 'Create new project fact',
        label: 'New fact',
        success: 'Project fact created'
      },
      edit: {
        title: 'Edit project fact',
        success: 'Project fact edited'
      },
      delete: {
        title: 'Delete fact',
        text: 'Are you sure you want to delete this fact?',
        success: 'Project fact deleted'
      }
    },
    reasonTypes: {
      navigationTitle: 'Financial Category Register',
      addNew:'Add New Category',
      new: {
        title: 'New Category',
        success: 'Category created'
      },
      edit: {
        title: 'Edit Category',
        success: 'Category edited'
      },
      delete: {
        title: 'Delete Category',
        text: 'Are you sure you want to delete this category?',
        success: 'Category deleted'
      },
      activate: {
        success: 'Category successfully %is_activated',
        activated: 'activated',
        deactivated: 'deactivated'
      },
      deactivate: {
        confirmation:
            'If you deactivate this Category, it can not be used in the future transactions until it is activated again!',
        deactivateCategory: 'Deactivate category'
      },
      fields: {
        customId: 'Category Id',
        name: 'Category Name',
        description: 'Description',
        status: 'Status'
      }
    },
    kpis: {
      navigationTitle: "KPI Register",
      addNew:'Add New KPI',
      fields: {
        levels: 'Threshold levels'
      },
      thresholds: {
        title: 'Thresholds',
        new: {
          title: 'Add threshold',
          label: 'Add threshold',
          success: 'Threshold added'
        },
        edit: {
          title: 'Edit threshold',
          success: 'Threshold edited'
        },
        delete: {
          title: 'Delete KPI',
          text: 'Are you sure you want to delete this threshold?',
          success: 'Threshold deleted'
        }
      },
      new: {
        label: 'New KPI',
        title: 'New KPI',
        success: 'KPI added'
      },
      edit: {
        title: 'Edit KPI',
        success: 'KPI edited'
      },
      delete: {
        title: 'Delete KPI',
        text: 'Are you sure you want to remove this kpi?',
        success: 'KPI deleted'
      }
    },
    matrixes: {
      navigationTitle: 'Risks & Opportunities Register',
      addNew:'Add New Matrix',
      type: {
        risk_matrix: 'Risk',
        opportunity_matrix: 'Opportunity'
      },
      new: {
        label: 'New matrix',
        title: 'New matrix',
        success: 'Matrix added'
      },
      edit: {
        title: 'Edit matrix',
        success: 'Matrix edited'
      },
      delete: {
        title: 'Delete matrix',
        text: 'Are you sure you want to delete this matrix?',
        success: 'Matrix deleted'
      },
      severities: {
        title: 'Severities',
        new: {
          title: 'New severity',
          success: 'Severity added'
        },
        edit: {
          title: 'Edit severity',
          success: 'Severity edited'
        },
        delete: {
          text: 'Are you sure you want to delete this severity?',
          success: 'Severity deleted'
        }
      },
      probabilities: {
        title: 'Probabilities',
        new: {
          title: 'New probability',
          success: 'Probability added'
        },
        edit: {
          title: 'Edit probability',
          success: 'Probability edited'
        },
        delete: {
          text: 'Are you sure you want to delete this probability?',
          success: 'Probability deleted'
        }
      },
      risk: {
        title: 'Risk score',
        new: {
          title: 'New risk score threshold',
          success: 'Risk score added'
        },
        edit: {
          title: 'Edit risk score threshold',
          success: 'Risk score edited'
        },
        delete: {
          text: 'Are you sure you want to delete this risk score threshold?',
          success: 'Risk score deleted'
        }
      }
    },
    users: {
      addNewUser:'Add New User',
      new: {
        label: 'New User',
        title: 'New User',
        success: 'User added'
      },
      edit: {
        title: 'Edit User',
        success: 'User edited'
      },
      delete: {
        title: 'Delete user',
        text: 'Are you sure you want to delete this user?',
        success: 'User deleted'
      },
      navigationTitle: 'User Administration'
    }
  },
  header: {
    menu: {
      signout: 'Signout',
      tos: 'Terms of service',
      copyright: '© Copyright 2022 PPM Core. All rights reserved.'
    }
  },
  notFound: {
    title: '404 - Page not found'
  },
  unauthorized: {
    title: 'You do not have permission to access this page'
  },
  EventStatus: {
    OPEN: 'Open',
    CLOSED: 'Closed'
  },
  PhaseStatus: {
    NOT_STARTED: 'Not started',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed'
  },
  tabulator: {
    headerFilter: {
      label: 'Filter column',
      gte: 'Greater than or equal',
      lte: 'Lesser than or equal',
      user: 'Search members by E-mail',
      userHint: 'Start typing E-mail...',
      thresholds: 'Filter by thresholds',
      filterBy: 'Filter by %title'
    }
  },
  misc: {
    more: 'See More',
    date: 'Date',
    startDate: 'Start date',
    finishDate: 'Finish date',
    endDate: 'End date',
    name: 'Name',
    status: 'Status',
    graph: 'Graph',
    comment: 'Comment',
    type: 'Type',
    description: 'Description',
    probability: 'Probability',
    severity: 'Severity',
    score: 'Score',
    risk: 'Risk | Risks',
    opportunity: 'Opportunity | Opportunities',
    edit: 'Edit',
    delete: 'Delete',
    show_in_card: 'Show in card',
    hide_in_card: 'Hide in card',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    preview: 'Preview',
    close: 'Close',
    confirm: 'Confirm',
    remove: 'Remove',
    amount: 'Amount',
    user: 'User',
    value: 'Value',
    report: 'Report',
    ok: 'Ok',
    clear: 'Clear',
    export: 'Export',
    invite: 'Invite',
    submit: 'Submit',
    pleaseConfirm: 'Please confirm',
    overview: 'Overview',
    latest: 'Latest',
    quickFilters: 'Quick filters',
    emptyField: 'Activity codes',
    uploadFile: 'Upload File',
    publish: 'Publish',
    hideColumns: 'Hide columns',
    showColumns: 'Show columns',
    discard: 'Discard',
    advanced: 'Advanced',
    import: 'Import',
    filters: 'Filters',
    clearAll: 'Clear all',
    showTooltips: 'Show tooltips',
    hideTooltips: 'Hide tooltips',
    users: 'Users',
    email: 'Email',
    id: 'Id',
    text: 'Text',
    number: 'Number',
    color: 'Color',
    thresholds: 'Thresholds',
    size: 'Size',
    operator: 'Operator',
    high: 'High',
    role: 'Role',
    apply: 'Apply',
    add: 'Add',
    deactivate: 'Deactivate',
    activate: 'Activate',
    request: 'Request',
    saveandclose: 'Save & Close',
    startTyping: 'Start typing...',
    up: 'Up',
    down: 'Down',
    expand: 'Expand',
    collapse: 'Collapse',
    rename:'Rename',
    created: 'Created',
    total: 'TOTAL',
    activityCodes:"Activity Codes"
  }
}
