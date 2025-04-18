function columnTable(ch, tableName, tableId, divId) {
  var resource = document.getElementById("numResource").value;

  var myTableDiv = document.getElementById(divId);
 
  var title = document.createElement('P');
  title.appendChild(document.createTextNode(tableName));
  myTableDiv.appendChild(title);

  var table = document.createElement('TABLE');
  table.id = tableId;

  var tableBody = document.createElement('TBODY');
  table.appendChild(tableBody);

  for (let i = 1; i <= resource; i++) {
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    var td = document.createElement('TD');

    td.appendChild(document.createTextNode("Resource " + String.fromCharCode("A".charCodeAt(0) + (i - 1))));
    tr.appendChild(td);

    var td = document.createElement('TD');
    var input = document.createElement("input");
    input.type = "text";
    input.id = ch + i;
    td.appendChild(input);

    tr.appendChild(td);
  }

  myTableDiv.appendChild(table);
}

function gridTable(ch, tableName, tableId, divId) {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  var myTableDiv = document.getElementById(divId);

  var title = document.createElement('P');
  title.appendChild(document.createTextNode(tableName));
  myTableDiv.appendChild(title);

  var table = document.createElement('TABLE');
  table.id = tableId;

  var tableBody = document.createElement('TBODY');
  table.appendChild(tableBody);

  for (let i = 0; i <= process; i++) {
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    for (let j = 0; j <= resource; j++) {
      var td = document.createElement('TD');

      if (i == 0 && j == 0) {
        td.appendChild(document.createTextNode("Resource /\nProcess"));
      }
      else if (i == 0) {
        td.appendChild(document.createTextNode(String.fromCharCode("A".charCodeAt(0) + (j - 1))));
      }
      else if (j == 0) {
        td.appendChild(document.createTextNode("Process " + i));
      }
      else {
        var input = document.createElement("input");
        input.type = "text";
        input.id = ch + i + j;
        td.appendChild(input);
      }
      tr.appendChild(td);
    }
  }
  myTableDiv.appendChild(table);
}

function safeSequenceTable(ch, tableName, tableId, divId) {
  var process = document.getElementById("numProcess").value;

  var myTableDiv = document.getElementById(divId);

  var title = document.createElement('P');
  title.appendChild(document.createTextNode(tableName));
  myTableDiv.appendChild(title);

  var table = document.createElement('TABLE');
  table.id = tableId;

  var tableBody = document.createElement('TBODY');
  table.appendChild(tableBody);

  var tr = document.createElement('TR');
  tableBody.appendChild(tr);

  for (let i = 1; i <= process; i++) {
    var td = document.createElement('TD');

    var input = document.createElement("input");
    input.type = "text";
    input.id = ch + i;
    td.appendChild(input);

    tr.appendChild(td);
  }

  myTableDiv.appendChild(table);
}

function createTables() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  if (!process) {
    alert('Enter number of process')
    return;
  }

  if (!resource) {
    alert('Enter types of resources')
    return;
  }

  columnTable('r', 'Resource Table', 'resourceTable', 'allTables');
  gridTable('a', 'Allocation Table', 'allocationTable', 'allTables');
  gridTable('m', 'Maximum Table', 'maximumTable', 'allTables');

  document.getElementById("createTables").disabled = true;
  document.getElementById("findNeed").disabled = false;
}

function isValid() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  for (var i = 1; i <= resource; i++) {
    var res = document.getElementById('r' + i).value;

    if (!res) {
      return false;
    }

    var allocate1 = 0;

    for (var j = 1; j <= process; j++) {
      allocate1 += Number(document.getElementById('a' + j + i).value);
      var max = document.getElementById('m' + j + i).value;
      var allocate2 = document.getElementById('a' + j + i).value;

      if (!allocate2 || !max) {
        return false;
      }

      if (max < allocate2)
        return false;
    }

    if (allocate1 > res)
      return false;
  }

  return true;
}

function calculateNeed() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  for (var i = 1; i <= process; i++) {
    for (var j = 1; j <= resource; j++) {
      var max = document.getElementById('m' + i + j).value;
      var allocate = document.getElementById('a' + i + j).value;
      document.getElementById('n' + i + j).value = max - allocate;
      document.getElementById('n' + i + j).disabled = true;
    }
  }
}

function calculateAvailable() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  for (var i = 1; i <= resource; i++) {
    var res = document.getElementById('r' + i).value;
    var allocate = 0;

    for (var j = 1; j <= process; j++) {
      allocate += Number(document.getElementById('a' + j + i).value);
    }

    document.getElementById('av' + i).value = res - allocate;
    document.getElementById('av' + i).disabled = true;
  }
}

function reset() {
  location.reload();
}

// Modified to not permanently change allocation table
function safetyAlgorithm(ch, tableName, tableId, divId, shouldCreateTable = true) {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  let completed = new Array(process);
  let sequence = new Array(process);
  let avail = new Array(resource);
  
  // Create temporary copies of allocation and available
  let tempAllocation = [];
  for (let i = 1; i <= process; i++) {
    tempAllocation[i] = [];
    for (let j = 1; j <= resource; j++) {
      tempAllocation[i][j] = Number(document.getElementById('a' + i + j).value);
    }
  }
  
  let tempAvailable = [];
  for (let i = 1; i <= resource; i++) {
    tempAvailable[i] = Number(document.getElementById('av' + i).value);
  }

  for (let i = 0; i < process; i++)
    completed[i] = 0;

  var count = 0;

  while (count < process) {
    var done = 0;
    for (let i = 1; i <= process; i++) {
      if (completed[i - 1] == 1)
        continue;

      var flag = 1;

      for (let j = 1; j <= resource; j++) {
        var need = Number(document.getElementById('n' + i + j).value);
        
        if (tempAvailable[j] < need) {
          flag = 0;
          break;
        }
      }

      if (flag == 0) {
        continue;
      }

      for (let j = 1; j <= resource; j++) {
        // Use the temporary allocation values
        tempAvailable[j] += tempAllocation[i][j];
      }

      count++;
      sequence[count - 1] = i;
      completed[i - 1] = 1;
      done = 1;
    }

    if (done == 0) {
      return false;
    }
  }

  if (shouldCreateTable) {
    safeSequenceTable(ch, tableName, tableId, divId);

    for (let i = 1; i <= process; i++) {
      document.getElementById(ch + i).value = sequence[i - 1];
      document.getElementById(ch + i).disabled = true;
    }
  } else {
    // Just update existing table
    let sequenceTable = document.getElementById(tableId);
    if (sequenceTable) {
      for (let i = 1; i <= process; i++) {
        document.getElementById(ch + i).value = sequence[i - 1];
      }
    } else {
      // Create new table if it doesn't exist
      safeSequenceTable(ch, tableName, tableId, divId);
      for (let i = 1; i <= process; i++) {
        document.getElementById(ch + i).value = sequence[i - 1];
        document.getElementById(ch + i).disabled = true;
      }
    }
  }
  
  return true;
}

function findNeed() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  if (!isValid()) {
    alert('Invalid data');
    reset();
  }

  gridTable('n', 'Need Table', 'needTable', 'allTables');
  calculateNeed();

  document.getElementById("findNeed").disabled = true;
  document.getElementById("findAvailable").disabled = false;
}

function findAvailable() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  if (!isValid()) {
    alert('Invalid data');
    reset();
  }

  columnTable('av', 'Available Table', 'availableTable', 'allTables');
  calculateAvailable();

  document.getElementById("findAvailable").disabled = true;
  document.getElementById("safeSequence").disabled = false;
}

let requestCounter = 0;

function generateSafeSeq() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;

  // Use a different ID for each sequence
  let sequenceId = requestCounter === 0 ? 'safeSequence' : 'safeSequence' + requestCounter;
  let sequenceTitle = requestCounter === 0 ? 'Initial Safe Sequence' : 'Safe Sequence After Request ' + requestCounter;
  
  if (!safetyAlgorithm('safe', sequenceTitle, sequenceId, 'allTables')) {
    alert('The system is not in a safe state');
    reset();
    return;
  }

  document.getElementById("safeSequence").disabled = true;
  document.getElementById("resourceRequest").disabled = false;
  
  // Show resource request section by default after finding initial safe sequence
  if (requestCounter === 0) {
    prepareResourceRequest();
  }
}

function prepareResourceRequest() {
  var resourceRequestPart = document.getElementById('resourceRequestPart');
  resourceRequestPart.style.display = 'block';
  
  var resource = document.getElementById("numResource").value;
  var div = document.getElementById("resourceRequestInputs");
  div.innerHTML = ''; // Clear previous inputs

  for (let i = 1; i <= resource; i++) {
    var p = document.createElement('p');
    p.innerHTML = `Enter request for Resource ${String.fromCharCode("A".charCodeAt(0) + (i - 1))} : 
      <input type="text" id="request${i}">`;
    div.appendChild(p);
  }

  var submitButton = document.createElement('input');
  submitButton.type = 'button';
  submitButton.value = 'Submit Request';
  submitButton.className = 'resource-request-button';
  submitButton.onclick = resourceRequest;
  div.appendChild(submitButton);
}

function resourceRequest() {
  var process = document.getElementById("numProcess").value;
  var resource = document.getElementById("numResource").value;
  var requestProcess = document.getElementById("requestProcess").value;

  // Validate process number
  if (!requestProcess || requestProcess < 1 || requestProcess > process) {
    alert('Invalid process number');
    return;
  }

  // Get and validate request
  var request = [];
  for (let i = 1; i <= resource; i++) {
    var requestValue = document.getElementById('request' + i).value;
    
    // Validate individual request
    if (!requestValue || isNaN(requestValue) || requestValue < 0) {
      alert(`Invalid request for Resource ${String.fromCharCode("A".charCodeAt(0) + (i - 1))}`);
      return;
    }
    request.push(Number(requestValue));
  }

  // Check if request exceeds max need
  for (let i = 1; i <= resource; i++) {
    var maxNeed = Number(document.getElementById('n' + requestProcess + i).value);
    if (request[i-1] > maxNeed) {
      alert(`Request exceeds maximum need for Resource ${String.fromCharCode("A".charCodeAt(0) + (i - 1))}`);
      return;
    }
  }

  // Check if request exceeds available resources
  for (let i = 1; i <= resource; i++) {
    var available = Number(document.getElementById('av' + i).value);
    if (request[i-1] > available) {
      alert(`Request exceeds available resources for Resource ${String.fromCharCode("A".charCodeAt(0) + (i - 1))}`);
      return;
    }
  }

  // Increment the request counter for this request
  requestCounter++;

  // Simulate resource allocation by updating tables
  for (let i = 1; i <= resource; i++) {
    var currentAvailable = Number(document.getElementById('av' + i).value);
    var currentAllocation = Number(document.getElementById('a' + requestProcess + i).value);
    var currentNeed = Number(document.getElementById('n' + requestProcess + i).value);
    
    // Update available
    document.getElementById('av' + i).value = currentAvailable - request[i-1];
    
    // Update allocation
    document.getElementById('a' + requestProcess + i).value = currentAllocation + request[i-1];
    
    // Update need
    document.getElementById('n' + requestProcess + i).value = currentNeed - request[i-1];
  }

  // Create a new safe sequence table with a unique ID
  let newSequenceId = 'safeSequence' + requestCounter;
  let newSequenceTitle = 'Safe Sequence After Request ' + requestCounter;
  
  // Check if the system remains in a safe state with a new safety sequence
  if (safetyAlgorithm('safe' + requestCounter, newSequenceTitle, newSequenceId, 'allTables')) {
    alert('Resource request ' + requestCounter + ' can be granted. System remains in a safe state.');
    
    // Clear the request inputs for the next request
    for (let i = 1; i <= resource; i++) {
      document.getElementById('request' + i).value = '';
    }
    document.getElementById('requestProcess').value = '';
    
    // Keep the resource request section visible for additional requests
  } else {
    // Rollback changes if unsafe
    alert('Resource request cannot be granted. System would enter an unsafe state.');
    
    // Restore previous values
    for (let i = 1; i <= resource; i++) {
      var previousAvailable = Number(document.getElementById('av' + i).value) + request[i-1];
      var previousAllocation = Number(document.getElementById('a' + requestProcess + i).value) - request[i-1];
      var previousNeed = Number(document.getElementById('n' + requestProcess + i).value) + request[i-1];
      
      document.getElementById('av' + i).value = previousAvailable;
      document.getElementById('a' + requestProcess + i).value = previousAllocation;
      document.getElementById('n' + requestProcess + i).value = previousNeed;
    }
    
    // Decrement the counter since this request was not successful
    requestCounter--;
  }
}