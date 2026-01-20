import React, { useState } from 'react';
import { Settings, Database, Calendar, DollarSign, Users, FileCheck, Clock, Shield, Link2, CheckCircle2, AlertTriangle, Workflow, Hash, Layers, Bell, User, Edit3, Send, XCircle, FileText, PlayCircle } from 'lucide-react';

export default function LeaveManagementSystem() {
  const [activeFlow, setActiveFlow] = useState('employee');
  const [hoveredNode, setHoveredNode] = useState(null);

  // ============ EMPLOYEE FLOW NODES ============
  const employeeNodes = {
    start: {
      id: 'start',
      type: 'start',
      label: 'Employee Login',
      x: 50,
      y: 350,
      icon: User,
      description: 'Employee accesses leave request portal'
    },
    createRequest: {
      id: 'createRequest',
      type: 'process',
      label: 'Create Leave Request',
      x: 220,
      y: 350,
      icon: Edit3,
      description: 'Fill form: Date range, Leave type, Reason'
    },
    attachDocs: {
      id: 'attachDocs',
      type: 'decision',
      label: 'Add Documents?',
      x: 400,
      y: 350,
      description: 'Optional: Upload supporting files'
    },
    uploadFiles: {
      id: 'uploadFiles',
      type: 'process',
      label: 'Upload Attachments',
      x: 400,
      y: 200,
      icon: FileText,
      description: 'System stores files in database'
    },
    checkBalance: {
      id: 'checkBalance',
      type: 'process',
      label: 'Check Balance',
      x: 580,
      y: 350,
      icon: Clock,
      description: 'System validates available leave days'
    },
    balanceValid: {
      id: 'balanceValid',
      type: 'decision',
      label: 'Balance OK?',
      x: 760,
      y: 350,
      description: 'Sufficient days available?'
    },
    showError: {
      id: 'showError',
      type: 'process',
      label: 'Display Error',
      x: 760,
      y: 500,
      icon: AlertTriangle,
      description: 'Show remaining balance to employee'
    },
    routeApproval: {
      id: 'routeApproval',
      type: 'process',
      label: 'Route to Approvers',
      x: 940,
      y: 350,
      icon: Workflow,
      description: 'System checks line_manager_id in profile'
    },
    sendNotification: {
      id: 'sendNotification',
      type: 'process',
      label: 'Send Notifications',
      x: 1120,
      y: 350,
      icon: Bell,
      description: 'Email/SMS to manager or HR'
    },
    trackStatus: {
      id: 'trackStatus',
      type: 'process',
      label: 'Track Status',
      x: 1300,
      y: 350,
      icon: FileCheck,
      description: 'Employee views request status in portal'
    },
    receiveDecision: {
      id: 'receiveDecision',
      type: 'decision',
      label: 'Request Status?',
      x: 1480,
      y: 350,
      description: 'Approved or Rejected?'
    },
    approved: {
      id: 'approved',
      type: 'process',
      label: 'Leave Approved',
      x: 1480,
      y: 200,
      icon: CheckCircle2,
      description: 'Calendar updated, balance deducted'
    },
    rejected: {
      id: 'rejected',
      type: 'process',
      label: 'Leave Rejected',
      x: 1480,
      y: 500,
      icon: XCircle,
      description: 'View rejection reason'
    },
    endApproved: {
      id: 'endApproved',
      type: 'end',
      label: 'Complete',
      x: 1660,
      y: 200,
      description: 'Process complete'
    },
    endRejected: {
      id: 'endRejected',
      type: 'end',
      label: 'Cancelled',
      x: 1660,
      y: 500,
      description: 'Can create new request'
    },
    cancelFlow: {
      id: 'cancelFlow',
      type: 'process',
      label: 'Cancel Request',
      x: 580,
      y: 500,
      icon: XCircle,
      description: 'Employee cancels before submission'
    },
  };

  const employeeConnections = [
    { from: 'start', to: 'createRequest', label: '' },
    { from: 'createRequest', to: 'attachDocs', label: '' },
    { from: 'attachDocs', to: 'uploadFiles', label: 'Yes', color: '#10b981' },
    { from: 'attachDocs', to: 'checkBalance', label: 'Skip', color: '#6b7280' },
    { from: 'uploadFiles', to: 'checkBalance', label: '' },
    { from: 'checkBalance', to: 'balanceValid', label: '' },
    { from: 'balanceValid', to: 'routeApproval', label: 'Valid', color: '#10b981' },
    { from: 'balanceValid', to: 'showError', label: 'Invalid', color: '#ef4444' },
    { from: 'showError', to: 'cancelFlow', label: '' },
    { from: 'cancelFlow', to: 'endRejected', label: '' },
    { from: 'routeApproval', to: 'sendNotification', label: '' },
    { from: 'sendNotification', to: 'trackStatus', label: '' },
    { from: 'trackStatus', to: 'receiveDecision', label: '' },
    { from: 'receiveDecision', to: 'approved', label: 'Approved', color: '#10b981' },
    { from: 'receiveDecision', to: 'rejected', label: 'Rejected', color: '#ef4444' },
    { from: 'approved', to: 'endApproved', label: '' },
    { from: 'rejected', to: 'endRejected', label: '' },
  ];

  // ============ ADMIN FLOW NODES ============
  const adminNodes = {
    start: {
      id: 'start',
      type: 'start',
      label: 'Admin Login',
      x: 50,
      y: 300,
      icon: Shield,
      description: 'HR Admin accesses configuration panel'
    },
    dashboard: {
      id: 'dashboard',
      type: 'process',
      label: 'Configuration Dashboard',
      x: 220,
      y: 300,
      icon: Settings,
      description: 'Central hub for all settings'
    },
    selectConfig: {
      id: 'selectConfig',
      type: 'decision',
      label: 'Config Type?',
      x: 420,
      y: 300,
      description: 'Choose configuration area'
    },

    leaveConfigure: {
      id: 'leaveConfigure',
      type: 'process',
      label: 'Leave Configure',
      x: 620,
      y: 300,
      icon: Settings,
      description: 'Centralized settings module'
    },
    configTabs: {
      id: 'configTabs',
      type: 'config',
      label: 'Configuration Tabs',
      x: 820,
      y: 300,
      icon: Layers,
      description: 'Types, Policies, Holidays'
    },

    leaveTypes: {
      id: 'leaveTypes',
      type: 'config',
      label: 'Leave Types',
      x: 1040,
      y: 150,
      icon: Calendar,
      description: 'Categories & Balances'
    },
    policies: {
      id: 'policies',
      type: 'config',
      label: 'Policy Rules',
      x: 1040,
      y: 300,
      icon: Shield,
      description: 'Entitlement Logic'
    },
    holidays: {
      id: 'holidays',
      type: 'config',
      label: 'Public Holidays',
      x: 1040,
      y: 450,
      icon: Globe,
      description: 'Non-working days'
    },

    saveConfig: {
      id: 'saveConfig',
      type: 'process',
      label: 'Save Configuration',
      x: 1240,
      y: 300,
      icon: Database,
      description: 'Persist all module settings'
    },
    testConfig: {
      id: 'testConfig',
      type: 'decision',
      label: 'Test Setup?',
      x: 1440,
      y: 300,
      description: 'Validate configurations'
    },
    runTests: {
      id: 'runTests',
      type: 'process',
      label: 'Run Test Cases',
      x: 1440,
      y: 450,
      icon: PlayCircle,
      description: 'Simulate leave requests'
    },
    activateSystem: {
      id: 'activateSystem',
      type: 'process',
      label: 'Activate System',
      x: 1440,
      y: 300,
      icon: CheckCircle2,
      description: 'Make live for employees'
    },
    notifyUsers: {
      id: 'notifyUsers',
      type: 'process',
      label: 'Send Announcements',
      x: 1640,
      y: 300,
      icon: Bell,
      description: 'Email all employees'
    },
    end: {
      id: 'end',
      type: 'end',
      label: 'Live',
      x: 1820,
      y: 300,
      description: 'System active'
    },
  };

  const adminConnections = [
    { from: 'start', to: 'dashboard', label: '' },
    { from: 'dashboard', to: 'selectConfig', label: '' },
    { from: 'selectConfig', to: 'leaveConfigure', label: '' },
    { from: 'leaveConfigure', to: 'configTabs', label: '' },
    { from: 'configTabs', to: 'leaveTypes', label: 'Types', color: '#8b5cf6' },
    { from: 'configTabs', to: 'policies', label: 'Policies', color: '#06b6d4' },
    { from: 'configTabs', to: 'holidays', label: 'Holidays', color: '#f59e0b' },

    { from: 'leaveTypes', to: 'saveConfig', label: '' },
    { from: 'policies', to: 'saveConfig', label: '' },
    { from: 'holidays', to: 'saveConfig', label: '' },

    { from: 'saveConfig', to: 'testConfig', label: '' },
    { from: 'testConfig', to: 'runTests', label: 'Yes', color: '#10b981' },
    { from: 'testConfig', to: 'activateSystem', label: 'Skip', color: '#6b7280' },
    { from: 'runTests', to: 'testConfig', label: 'Retry', color: '#f59e0b', curved: true },
    { from: 'runTests', to: 'activateSystem', label: 'Pass', color: '#10b981' },
    { from: 'activateSystem', to: 'notifyUsers', label: '' },
    { from: 'notifyUsers', to: 'end', label: '' },
  ];

  // ============ HR FLOW NODES ============
  const hrNodes = {
    start: {
      id: 'start',
      type: 'start',
      label: 'Request Received',
      x: 50,
      y: 350,
      icon: Bell,
      description: 'Notification arrives for HR'
    },
    hrDashboard: {
      id: 'hrDashboard',
      type: 'process',
      label: 'HR Dashboard',
      x: 220,
      y: 350,
      icon: Users,
      description: 'View pending approvals queue'
    },
    openRequest: {
      id: 'openRequest',
      type: 'process',
      label: 'Open Request',
      x: 400,
      y: 350,
      icon: FileCheck,
      description: 'Load request details from DB'
    },

    validateBalance: {
      id: 'validateBalance',
      type: 'decision',
      label: 'Balance Valid?',
      x: 580,
      y: 350,
      description: 'System auto-checks entitlement'
    },
    balanceError: {
      id: 'balanceError',
      type: 'process',
      label: 'Balance Issue',
      x: 580,
      y: 500,
      icon: AlertTriangle,
      description: 'Insufficient leave days'
    },

    checkDocs: {
      id: 'checkDocs',
      type: 'decision',
      label: 'Docs Attached?',
      x: 760,
      y: 350,
      description: 'Optional: Review if present'
    },

    loadContext: {
      id: 'loadContext',
      type: 'process',
      label: 'Load Context',
      x: 940,
      y: 350,
      icon: Database,
      description: 'Query: Attendance history, Team calendar'
    },

    hrDecision: {
      id: 'hrDecision',
      type: 'decision',
      label: 'Approve?',
      x: 1120,
      y: 350,
      description: 'HR makes final decision'
    },

    rejectRequest: {
      id: 'rejectRequest',
      type: 'process',
      label: 'Reject Request',
      x: 1120,
      y: 500,
      icon: XCircle,
      description: 'Update status to "Rejected"'
    },
    notifyReject: {
      id: 'notifyReject',
      type: 'process',
      label: 'Send Rejection',
      x: 940,
      y: 620,
      icon: Bell,
      description: 'Email employee with reason'
    },

    approveRequest: {
      id: 'approveRequest',
      type: 'process',
      label: 'Approve Request',
      x: 1120,
      y: 200,
      icon: CheckCircle2,
      description: 'Update status to "Approved"'
    },

    updateBalance: {
      id: 'updateBalance',
      type: 'process',
      label: 'Update Balance',
      x: 1300,
      y: 200,
      icon: Clock,
      description: 'Deduct days from employee balance'
    },
    syncCalendar: {
      id: 'syncCalendar',
      type: 'process',
      label: 'Sync Calendar',
      x: 1480,
      y: 200,
      icon: Calendar,
      description: 'Block dates in team calendar'
    },

    checkPayment: {
      id: 'checkPayment',
      type: 'decision',
      label: 'Paid Leave?',
      x: 1660,
      y: 200,
      description: 'Check leave type config'
    },

    noDeduction: {
      id: 'noDeduction',
      type: 'process',
      label: 'No Salary Change',
      x: 1660,
      y: 80,
      icon: DollarSign,
      description: 'Maintain full salary'
    },

    queueDeduction: {
      id: 'queueDeduction',
      type: 'process',
      label: 'Queue Deduction',
      x: 1840,
      y: 200,
      icon: DollarSign,
      description: 'Send to payroll system'
    },

    notifyApproval: {
      id: 'notifyApproval',
      type: 'process',
      label: 'Send Approval',
      x: 2020,
      y: 200,
      icon: Bell,
      description: 'Email employee, manager, team'
    },

    endApproved: {
      id: 'endApproved',
      type: 'end',
      label: 'Complete',
      x: 2180,
      y: 200,
      description: 'Process complete'
    },
    endRejected: {
      id: 'endRejected',
      type: 'end',
      label: 'Rejected',
      x: 740,
      y: 620,
      description: 'Request denied'
    },
  };

  const hrConnections = [
    { from: 'start', to: 'hrDashboard', label: '' },
    { from: 'hrDashboard', to: 'openRequest', label: '' },
    { from: 'openRequest', to: 'validateBalance', label: '' },
    { from: 'validateBalance', to: 'checkDocs', label: 'Valid', color: '#10b981' },
    { from: 'validateBalance', to: 'balanceError', label: 'Invalid', color: '#ef4444' },
    { from: 'checkDocs', to: 'loadContext', label: 'Yes/No', color: '#6b7280' },
    { from: 'balanceError', to: 'rejectRequest', label: '' },
    { from: 'loadContext', to: 'hrDecision', label: '' },
    { from: 'hrDecision', to: 'approveRequest', label: 'Yes', color: '#10b981' },
    { from: 'hrDecision', to: 'rejectRequest', label: 'No', color: '#ef4444' },
    { from: 'rejectRequest', to: 'notifyReject', label: '' },
    { from: 'notifyReject', to: 'endRejected', label: '' },
    { from: 'approveRequest', to: 'updateBalance', label: '' },
    { from: 'updateBalance', to: 'syncCalendar', label: '' },
    { from: 'syncCalendar', to: 'checkPayment', label: '' },
    { from: 'checkPayment', to: 'noDeduction', label: 'Paid', color: '#10b981' },
    { from: 'checkPayment', to: 'queueDeduction', label: 'Unpaid', color: '#f59e0b' },
    { from: 'noDeduction', to: 'notifyApproval', label: '' },
    { from: 'queueDeduction', to: 'notifyApproval', label: '' },
    { from: 'notifyApproval', to: 'endApproved', label: '' },
  ];

  const renderNode = (node, flowType) => {
    const Icon = node.icon;
    const isHovered = hoveredNode === node.id;

    const colorMap = {
      employee: '#10b981',
      admin: '#8b5cf6',
      hr: '#ec4899'
    };

    const primaryColor = colorMap[flowType];

    if (node.type === 'start' || node.type === 'end') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <circle
            r="35"
            fill={node.type === 'start' ? primaryColor : '#f97316'}
            stroke={isHovered ? '#ffffff' : 'none'}
            strokeWidth="3"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          />
          {Icon && <Icon x="-12" y="-12" width="24" height="24" stroke="#ffffff" strokeWidth="2" />}
          <text
            y="55"
            textAnchor="middle"
            fill="#1f2937"
            fontSize="12"
            fontWeight="700"
          >
            {node.label}
          </text>
        </g>
      );
    }

    if (node.type === 'decision') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <path
            d="M 0,-45 L 70,0 L 0,45 L -70,0 Z"
            fill="#fbbf24"
            stroke={isHovered ? '#ffffff' : '#f59e0b'}
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          />
          <text
            y="-5"
            textAnchor="middle"
            fill="#78350f"
            fontSize="11"
            fontWeight="700"
          >
            {node.label.split(' ')[0]}
          </text>
          <text
            y="10"
            textAnchor="middle"
            fill="#78350f"
            fontSize="11"
            fontWeight="700"
          >
            {node.label.split(' ').slice(1).join(' ')}
          </text>
        </g>
      );
    }

    if (node.type === 'config') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <rect
            x="-70"
            y="-40"
            width="140"
            height="80"
            rx="10"
            fill="url(#configGradient)"
            stroke={isHovered ? '#ffffff' : '#06b6d4'}
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          />
          {Icon && <Icon x="-12" y="-22" width="24" height="24" stroke="#ffffff" strokeWidth="2.5" />}
          <text
            y="12"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="700"
          >
            {node.label.split(' ')[0]}
          </text>
          <text
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="700"
          >
            {node.label.split(' ').slice(1).join(' ')}
          </text>
        </g>
      );
    }

    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <rect
          x="-65"
          y="-35"
          width="130"
          height="70"
          rx="8"
          fill={primaryColor}
          stroke={isHovered ? '#ffffff' : 'none'}
          strokeWidth="3"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        />
        {Icon && <Icon x="-12" y="-20" width="24" height="24" stroke="#ffffff" strokeWidth="2" />}
        <text
          y="15"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontWeight="700"
        >
          {node.label}
        </text>
      </g>
    );
  };

  const renderConnection = (conn) => {
    const nodesMap = activeFlow === 'employee' ? employeeNodes : (activeFlow === 'admin' ? adminNodes : hrNodes);
    const fromNode = nodesMap[conn.from];
    const toNode = nodesMap[conn.to];

    if (!fromNode || !toNode) return null;

    const color = conn.color || '#94a3b8';
    const labelColor = conn.color || '#64748b';

    let path, labelX, labelY;

    if (conn.curved) {
      const controlX = (fromNode.x + toNode.x) / 2 - 100;
      const controlY = (fromNode.y + toNode.y) / 2 - 50;
      path = `M ${fromNode.x + 65} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x - 65} ${toNode.y}`;
      labelX = controlX;
      labelY = controlY;
    } else {
      path = `M ${fromNode.x + 65} ${fromNode.y} L ${toNode.x - 65} ${toNode.y}`;
      labelX = (fromNode.x + toNode.x) / 2;
      labelY = fromNode.y - 10;
    }

    return (
      <g key={`${conn.from}-${conn.to}`}>
        <defs>
          <marker
            id={`arrow-${conn.from}-${conn.to}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        <path
          d={path}
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          markerEnd={`url(#arrow-${conn.from}-${conn.to})`}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
        {conn.label && (
          <g>
            <rect
              x={labelX - 25}
              y={labelY - 12}
              width="50"
              height="20"
              rx="4"
              fill="#ffffff"
              stroke={color}
              strokeWidth="1.5"
            />
            <text
              x={labelX}
              y={labelY + 3}
              textAnchor="middle"
              fill={labelColor}
              fontSize="10"
              fontWeight="700"
            >
              {conn.label}
            </text>
          </g>
        )}
      </g>
    );
  };

  const flowInfo = {
    employee: {
      title: 'Employee Leave Request Flow',
      description: 'Complete digital workflow from request creation to final approval notification',
      color: '#10b981',
      icon: User,
      canvasWidth: 1750,
      canvasHeight: 650
    },
    admin: {
      title: 'Admin Configuration Setup',
      description: 'System setup for leave types, balances, approval workflows, and document settings',
      color: '#8b5cf6',
      icon: Settings,
      canvasWidth: 1900,
      canvasHeight: 600
    },
    hr: {
      title: 'HR Approval Processing Flow',
      description: 'Automated validation, approval decision, and post-approval system updates',
      color: '#ec4899',
      icon: Users,
      canvasWidth: 2250,
      canvasHeight: 700
    }
  };

  const currentFlow = flowInfo[activeFlow];
  const FlowIcon = currentFlow.icon;

  return (
    <div style={{
      fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #0a0118 0%, #1a0b2e 50%, #0f172a 100%)',
      minHeight: '100vh',
      color: '#f1f5f9',
      padding: '2.5rem 2rem'
    }}>
      <div style={{ maxWidth: '2400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em'
          }}>
            8sPeople Leave Management System
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '1000px', lineHeight: '1.8' }}>
            Complete end-to-end digital workflows for leave request management
          </p>
        </div>

        {/* Flow Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2.5rem',
          flexWrap: 'wrap'
        }}>
          {Object.entries(flowInfo).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveFlow(key)}
                style={{
                  background: activeFlow === key
                    ? `linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%)`
                    : 'rgba(255,255,255,0.05)',
                  border: activeFlow === key ? 'none' : '2px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  padding: '1rem 2rem',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  boxShadow: activeFlow === key ? `0 8px 24px ${info.color}40` : 'none',
                  transform: activeFlow === key ? 'translateY(-2px)' : 'none'
                }}
              >
                <Icon size={22} strokeWidth={2.5} />
                {info.title.split(' ')[0]} Flow
              </button>
            );
          })}
        </div>

        {/* Current Flow Info */}
        <div style={{
          background: `linear-gradient(135deg, ${currentFlow.color}15 0%, ${currentFlow.color}08 100%)`,
          border: `2px solid ${currentFlow.color}40`,
          borderRadius: '20px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            background: currentFlow.color,
            borderRadius: '16px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FlowIcon size={32} strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              marginBottom: '0.5rem',
              color: currentFlow.color
            }}>
              {currentFlow.title}
            </h2>
            <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {currentFlow.description}
            </p>
          </div>
        </div>

        {/* Flowchart Canvas */}
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fed7aa 100%)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          overflow: 'auto',
          marginBottom: '3rem'
        }}>
          <svg width={currentFlow.canvasWidth} height={currentFlow.canvasHeight} style={{ display: 'block' }}>
            <defs>
              <linearGradient id="configGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            {activeFlow === 'employee' && employeeConnections.map(renderConnection)}
            {activeFlow === 'admin' && adminConnections.map(renderConnection)}
            {activeFlow === 'hr' && hrConnections.map(renderConnection)}

            {activeFlow === 'employee' && Object.values(employeeNodes).map(node => renderNode(node, 'employee'))}
            {activeFlow === 'admin' && Object.values(adminNodes).map(node => renderNode(node, 'admin'))}
            {activeFlow === 'hr' && Object.values(hrNodes).map(node => renderNode(node, 'hr'))}
          </svg>
        </div>

        {/* Key Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {activeFlow === 'employee' && [
            { icon: Edit3, title: 'Easy Request Creation', desc: 'Simple form with date picker and leave type selection' },
            { icon: FileText, title: 'Optional Documents', desc: 'Upload supporting files when needed' },
            { icon: Clock, title: 'Real-time Balance Check', desc: 'Instant validation of available leave days' },
            { icon: Bell, title: 'Status Tracking', desc: 'Track approval progress in employee portal' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'start'
              }}>
                <div style={{
                  background: '#10b981',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  display: 'flex'
                }}>
                  <Icon size={20} stroke="#ffffff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '1rem' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}

          {activeFlow === 'admin' && [
            { icon: Calendar, title: 'Leave Type Management', desc: 'Create unlimited leave categories with custom rules' },
            { icon: Clock, title: 'Request Balance Setup', desc: 'Annual entitlement, accrual, and carry-over policies' },
            { icon: Workflow, title: 'Dynamic Routing', desc: 'Automatic approval routing based on org structure' },
            { icon: Database, title: 'Centralized Config', desc: 'All settings stored in database for system-wide use' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'start'
              }}>
                <div style={{
                  background: '#8b5cf6',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  display: 'flex'
                }}>
                  <Icon size={20} stroke="#ffffff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '1rem' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}

          {activeFlow === 'hr' && [
            { icon: CheckCircle2, title: 'Auto-validation', desc: 'System checks balance before HR review' },
            { icon: Database, title: 'Context Loading', desc: 'Auto-fetch attendance history and team calendar' },
            { icon: Calendar, title: 'Calendar Sync', desc: 'Automatic updates to team and personal calendars' },
            { icon: DollarSign, title: 'Payroll Integration', desc: 'Queue salary adjustments for unpaid leave' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'start'
              }}>
                <div style={{
                  background: '#ec4899',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  display: 'flex'
                }}>
                  <Icon size={20} stroke="#ffffff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '1rem' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredNode && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 1, 24, 0.98)',
            border: `3px solid ${currentFlow.color}`,
            borderRadius: '20px',
            padding: '1.5rem 2.5rem',
            maxWidth: '600px',
            boxShadow: `0 20px 50px ${currentFlow.color}40`,
            animation: 'fadeIn 0.2s ease',
            zIndex: 1000
          }}>
            <div style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.2rem', color: currentFlow.color }}>
              {(activeFlow === 'employee' ? employeeNodes : (activeFlow === 'admin' ? adminNodes : hrNodes))[hoveredNode]?.label}
            </div>
            <div style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: '1.7' }}>
              {(activeFlow === 'employee' ? employeeNodes : (activeFlow === 'admin' ? adminNodes : hrNodes))[hoveredNode]?.description}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '50px', height: '35px', background: currentFlow.color, borderRadius: '8px' }}></div>
            <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600' }}>Process Step</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '50px',
              height: '35px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '10px',
              border: '2px solid #06b6d4'
            }}></div>
            <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600' }}>Configuration</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '35px', height: '35px', background: '#fbbf24', transform: 'rotate(45deg)', borderRadius: '6px' }}></div>
            <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600' }}>Decision Point</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '35px', height: '35px', background: '#f97316', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600' }}>End State</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(15px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        button:hover {
          transform: translateY(-2px) !important;
        }
      `}</style>
    </div>
  );
}
