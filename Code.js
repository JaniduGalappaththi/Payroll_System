// Sheet ID එක global variable එකක් ලෙස
var SPREADSHEET_ID = "11ms5OuaL2qKVtt1HLuir9hkFliskMG1KSexuhh71XGE"; 

// Web App එක run වෙන ප්‍රධාන function එක (UPDATED FOR LICENSE CHECK)
function doGet(e) {
  var template;
  
  // 1. යූසර්ගේ ඊමේල් එක ලබාගැනීම
  var email = Session.getEffectiveUser().getEmail();
  
  // 2. ලයිසන් එක තියෙනවද කියලා Firestore.gs හරහා චෙක් කිරීම
  // (සටහන: මෙය වැඩ කිරීමට Firestore.gs ෆයිල් එක තිබීම අනිවාර්ය වේ)
  var hasAccess = false;
  
  try {
    hasAccess = checkLicense(email); // Firestore.gs හි ඇති function එක
  } catch (err) {
    Logger.log("License Check Error: " + err);
    hasAccess = false; // එරර් එකක් ආවොත් ආරක්ෂාවට ඇප් එක බ්ලොක් කිරීම
  }

  // 3. තීරණය ගැනීම (Logic Branching)
  if (hasAccess === true) {
    // --- ලයිසන් ඇත: සාමාන්‍ය පරිදි ඇප් එක වැඩ කරයි ---
    var page = e.parameter.page;

    if (page == 'add') {
      template = HtmlService.createTemplateFromFile('AddEmployee.html');
    } 
    else if (page == 'list') {
      template = HtmlService.createTemplateFromFile('EmployeeList.html');
    }
    else if (page == 'salary') {
      template = HtmlService.createTemplateFromFile('Salary.html');
    }
    else if (page == 'runpayroll') { 
      template = HtmlService.createTemplateFromFile('RunPayroll.html');
    }
    else if (page == 'attendance') { 
      template = HtmlService.createTemplateFromFile('Attendance.html');
    }
    else if (page == 'payslip') { 
      template = HtmlService.createTemplateFromFile('Payslip.html');
    }
    else if (page == 'reports') { 
      template = HtmlService.createTemplateFromFile('Reports.html');
    }
    else {
      // Default: Dashboard
      template = HtmlService.createTemplateFromFile('Dashboard.html');
    }
    
    // Page Title for Licensed Users
    var pageTitle = 'Aurora Solar Payroll';

  } else {
    // --- ලයිසන් නැත: Subscribe පිටුව පෙන්වයි ---
    template = HtmlService.createTemplateFromFile('Subscribe.html');
    var pageTitle = 'Access Denied';
  }
  
  template.webAppUrl = ScriptApp.getService().getUrl();

  return template.evaluate()
    .setTitle(pageTitle)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// HTML එකට CSS වගේ දේවල් include කරන function එක
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// === මෙතැන් සිට පහළට පරණ Functions එලෙසම ඇත ===

// Payroll history එක ගන්න function එක
function getPayrollHistory() {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('PayrollHistory');
    if (sheet.getLastRow() <= 1) { return []; }
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    
    var payrollData = data.map(function(row) {
      return {
        date: row[0], empId: row[1], name: row[2],
        gross: row[3], net: row[4], status: row[5]
      };
    });
    return payrollData;
  } catch (e) {
    Logger.log("Error getPayrollHistory: " + e);
    return []; 
  }
}

// Employee Details save කිරීමේ function එක
function saveEmployeeDetails(formObject) {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('Employees');
    var idColumn = sheet.getRange("A:A").getValues();
    for (var i = 0; i < idColumn.length; i++) {
      if (idColumn[i][0] == formObject.empId) {
        return { status: "error", message: "Employee ID already exists." };
      }
    }
    var newRow = [
      formObject.empId, formObject.firstName, formObject.lastName,
      formObject.jobTitle, formObject.department, new Date(formObject.joinDate)
    ];
    sheet.appendRow(newRow);
    return { status: "success", message: "Employee successfully added!" };
  } catch (e) {
    Logger.log("Save Error: " + e);
    return { status: "error", message: "Failed to save: " + e.message };
  }
}

// Employee List එක ගෙන ඒමේ function එක
function getEmployeeList() {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('Employees');
    if (sheet.getLastRow() <= 1) {
      return []; 
    }
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    
    var employeeData = data.map(function(row) {
      return {
        empId: row[0], 
        firstName: row[1], 
        lastName: row[2],
        jobTitle: row[3], 
        department: row[4], 
        joinDate: row[5]
      };
    });
    
    return employeeData; 
  } catch (e) {
    Logger.log("Error getEmployeeList: " + e);
    return []; 
  }
}

// "Delete" බට්න් එකට අදාළ FUNCTION එක
function deleteEmployeeRecord(empId) {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('Employees');
    var data = sheet.getRange("A:A").getValues(); 
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == empId) {
        sheet.deleteRow(i + 1); 
        return { status: "success", message: "Employee deleted successfully." };
      }
    }
    return { status: "error", message: "Employee ID not found." };
  } catch (e) {
    Logger.log("Delete Error: " + e);
    return { status: "error", message: "Failed to delete: " + e.message };
  }
}

// "Salary" Page එකට අදාළ FUNCTIONS
function updateEmployeeSalary(salaryData) {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('Salaries');
    var data = sheet.getDataRange().getValues();
    var rowFound = false;
    for (var i = 1; i < data.length; i++) { 
      if (data[i][0] == salaryData.empId) {
        var rowToUpdate = i + 1;
        sheet.getRange(rowToUpdate, 2).setValue(salaryData.baseSalary);
        sheet.getRange(rowToUpdate, 3).setValue(salaryData.payType);
        sheet.getRange(rowToUpdate, 4).setValue(salaryData.allowance);
        rowFound = true;
        break;
      }
    }
    if (!rowFound) {
      sheet.appendRow([
        salaryData.empId, salaryData.baseSalary,
        salaryData.payType, salaryData.allowance
      ]);
    }
    return { status: "success", message: "Salary updated for " + salaryData.empId };
  } catch (e) {
    Logger.log("Update Salary Error: " + e);
    return { status: "error", message: "Failed to update: " + e.message };
  }
}

function getEmployeeSalaryData() {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var empSheet = SPREADSHEET.getSheetByName('Employees');
    var salSheet = SPREADSHEET.getSheetByName('Salaries');
    if (empSheet.getLastRow() <= 1) { return []; }
  
    var empData = empSheet.getRange(2, 1, empSheet.getLastRow() - 1, 6).getValues();
    var salData = salSheet.getDataRange().getValues(); 
    var salaryMap = {};
    for (var i = 1; i < salData.length; i++) {
      var empId = salData[i][0];
      if (empId) { 
        salaryMap[empId] = {
          baseSalary: salData[i][1], payType: salData[i][2], allowance: salData[i][3]
        };
      }
    }
    
    var combinedData = empData.map(function(empRow) {
      var empId = empRow[0];
      var salaryInfo = salaryMap[empId] || {};
      return {
        empId: empId, firstName: empRow[1], lastName: empRow[2],
        baseSalary: salaryInfo.baseSalary,
        payType: salaryInfo.payType,
        allowance: salaryInfo.allowance
      };
    });
    return combinedData;
  } catch (e) {
    Logger.log("Get Salary Data Error: " + e);
    return [];
  }
}

// "RUN PAYROLL" PAGE එකට අදාළ FUNCTIONS
function getEmployeeNames() {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('Employees');
    if (sheet.getLastRow() <= 1) { return []; }
    
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
    
    var names = data.map(function(row) {
      return {
        empId: row[0],
        name: `${row[1]} ${row[2]}` 
      };
    });
    return names;
    
  } catch (e) {
    Logger.log("Error getEmployeeNames: " + e);
    return [];
  }
}

// "Smart" Function (Salary + Attendance)
function getSalaryDetailsForEmployee(empId) {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var salSheet = SPREADSHEET.getSheetByName('Salaries');
    var salData = salSheet.getDataRange().getValues();
    var salaryDetails = null;
    
    // --- 1. Salary details හොයනවා ---
    for (var i = 1; i < salData.length; i++) { 
      if (salData[i][0] == empId) { 
        salaryDetails = {
          baseSalary: salData[i][1],
          payType: salData[i][2],
          allowance: salData[i][3]
        };
        break; 
      }
    }
    
    if (salaryDetails == null) {
      return { error: "Salary details not found for this employee." };
    }

    // --- 2. Total Hours හොයනවා ---
    var attSheet = SPREADSHEET.getSheetByName('AttendanceLog');
    var attData = attSheet.getDataRange().getValues();
    var totalHours = 0;

    for (var j = 1; j < attData.length; j++) { 
      if (attData[j][0] == empId) {
        if (attData[j][2] && !isNaN(parseFloat(attData[j][2]))) {
           totalHours += parseFloat(attData[j][2]); 
        }
      }
    }
    
    // --- 3. Data දෙකම එකතු කරලා return කරනවා ---
    salaryDetails.totalHours = totalHours;
    return salaryDetails;
    
  } catch (e) {
    Logger.log("Error getSalaryDetails: " + e);
    return null;
  }
}

// Payment එක 'PayrollHistory' sheet එකේ save කරන function එක
function logPaymentToHistory(paymentData) {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('PayrollHistory');
    
    var newRow = [
      new Date(paymentData.date),
      paymentData.empId,
      paymentData.empName,
      paymentData.grossPay,
      paymentData.netPay,
      paymentData.status
    ];
    
    sheet.appendRow(newRow);
    
    return { status: "success", message: "Payment successfully logged to Payroll History!" };
    
  } catch (e) {
    Logger.log("Error logging payment: " + e);
    return { status: "error", message: "Failed to log payment: " + e.message };
  }
}

// "ATTENDANCE" PAGE එකට අදාළ FUNCTION
function logAttendance(attendanceData) {
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('AttendanceLog');
    
    var newRow = [
      attendanceData.empId,
      new Date(attendanceData.date),
      attendanceData.hours,
      attendanceData.type
    ];
    
    sheet.appendRow(newRow);
    
    return { status: "success", message: "Attendance logged successfully!" };
    
  } catch (e) {
    Logger.log("Error logging attendance: " + e);
    return { status: "error", message: "Failed to log attendance: " + e.message };
  }
}

// "REPORTS" PAGE එකට අදාළ FUNCTION
function generateMonthlySummary(yearMonth) { 
  var SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    var sheet = SPREADSHEET.getSheetByName('PayrollHistory');
    if (sheet.getLastRow() <= 1) { 
      return { totalGross: 0, totalNet: 0, count: 0 }; 
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    
    var totalGross = 0;
    var totalNet = 0;
    var paymentCount = 0;

    for (var i = 0; i < data.length; i++) {
      var paymentDate = new Date(data[i][0]); 
      var paymentYearMonth = paymentDate.getFullYear() + '-' + ('0' + (paymentDate.getMonth() + 1)).slice(-2);

      if (paymentYearMonth === yearMonth) {
        totalGross += parseFloat(data[i][3]); 
        totalNet += parseFloat(data[i][4]);   
        paymentCount++;
      }
    }

    return { 
      totalGross: totalGross, 
      totalNet: totalNet, 
      count: paymentCount 
    };

  } catch (e) {
    Logger.log("Error generating report: " + e);
    throw new Error("Failed to generate report: " + e.message);
  }
}