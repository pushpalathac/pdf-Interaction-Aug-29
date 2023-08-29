var docID = null;

function handleRoleSelect() {
    var role = document.getElementById('role').value;
    console.log('Selected role:', role); // Outputs the selected role, such as "engineer"

    // ... existing code ...
}
var previousQuestion=null;
function regenerateFunction() {
    if (previousQuestion !== null) {
        document.getElementById('question').value = previousQuestion;
        chatWithPDF()
    }    
}

function clearAll() {
    const chatSection = document.getElementById('chatSection');
    const roleSelect = document.getElementById('role');
    const pdfFileInput = document.getElementById('pdfFile');
    const chatContainer = document.getElementById('chatContainer');
    //const chatResponse = document.getElementById('chatResponse');
    const questionInput = document.getElementById('question');
    //const Uploadresponse = document.getElementById('uploadResponse');
    const fileInput = document.getElementById("pdfFile");
    const fileLabel = document.getElementById("fileLabel");
    const uploadResponse = document.getElementById('uploadResponse');
    fileInput.value = null; // Clear the selected file
    fileLabel.querySelector(".file-text").textContent = "Drop or Select PDF file";

    chatSection.classList.add('hidden'); // Hide the chat section
    roleSelect.selectedIndex = 0; // Reset role selection
    pdfFileInput.value = ''; // Reset file input
    chatContainer.innerHTML = ''; // Clear chat history
    //chatResponse = ''; // Clear chat response
    questionInput.value = ''; // Clear question input
    uploadResponse.innerHTML= '';
    //uploadResponseElement.style.fontWeight = 'normal';


}


function handleFileDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.add("drag-over");
}

function handleFileDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove("drag-over");
}

function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove("drag-over");

    var droppedfile = event.dataTransfer.files[0];
 
   console.log(droppedfile);
 
   var fileLabel = document.getElementById("fileLabel");
   console.log(fileLabel);
   var selectedFileName = droppedfile?.name || "Drop or Select PDF file";
   fileLabel.querySelector(".file-text").textContent = selectedFileName;
 
    console.log(selectedFileName);
    if (droppedfile) {
      
        uploadPDF1(droppedfile); // Handle the selected file
    } 
    
}

function handleFileSelect() {
    var fileInput = document.getElementById('pdfFile');
  
    console.log(fileInput);
    var selectedFileName = fileInput.files[0]?.name || "Drop or Select PDF file";
    fileLabel.querySelector(".file-text").textContent = selectedFileName;
    var file = fileInput.files[0];
    console.log(file);
    if (file) {
        uploadPDF(file);
    }
}

function uploadPDF1(droppedfile) {
    
    document.getElementById('chatSection').classList.add('hidden');
    var formData = new FormData();
    formData.append('file', droppedfile);

    response = fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        docID = data.docID;
        console.log(docID);
        document.getElementById('uploadResponse').innerText = 'File is ready for interaction.' ;
    // Show the chat section after successful upload
        //var uploadResponseElement = document.getElementById('uploadResponse');
        //uploadResponseElement.innerText = 'File is ready for interaction.';
       // uploadResponseElement.style.fontWeight = 'bold';
        document.getElementById('chatSection').classList.remove('hidden');
    })
    .catch(error => {
        document.getElementById('uploadResponse').innerText = 'Error: ' + error;
       //uploadResponseElement.innerHTML ='Error:' + error;
    });
}


function uploadPDF(file) {
    
    document.getElementById('chatSection').classList.add('hidden');
   
    var formData = new FormData();
    formData.append('file', file);

    response = fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        docID = data.docID;
        console.log(docID);
        document.getElementById('uploadResponse').innerText = 'File is ready for interaction.';
       // uploadResponseElement.style.fontWeight = 'bold';
       // var uploadResponseElement = document.getElementById('uploadResponse');
       // uploadResponseElement.innerText = 'File is ready for interaction.';
       // uploadResponseElement.style.fontWeight = 'bold';
    // Show the chat section after successful upload
        document.getElementById('chatSection').classList.remove('hidden');
    })
    .catch(error => {
        document.getElementById('uploadResponse').innerText = 'Error: ' + error;
        //uploadResponseElement.innerHTML = 'Error: ' + error;
    });
}


var LastQueston=null;
function chatWithPDF() {

    var questionInput = document.getElementById('question');
    var question = questionInput.value;
    LastQueston = question;
    if (question.trim() === '') {
        return;
    }

    previousQuestion = question;
   // var question = document.getElementById('question').value;
   // LastQueston=question;
    if (docID && question) {
        fetch('/chat/' + docID, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ "sender": "User", "message": question }])
        })
        .then(response => response.json())
        .then(data => {
            var chatContainer = document.getElementById('chatContainer');

            // Append the question
            var questionDiv = document.createElement('div');
            questionDiv.innerText = 'Question: ' + question;
            chatContainer.appendChild(questionDiv);

            // Append the response
            var responseDiv = document.createElement('div');
            responseDiv.innerText = 'Response: ' + data.response;
            chatContainer.appendChild(responseDiv);

            questionInput.value = '';
        })
        .catch(error => {
            document.getElementById('chatContainer').innerText = 'Error: ' + error;
        });
    }
}

// Add an event listener for "Enter" key press on the question input field
document.getElementById('question').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default behavior (form submission)
        chatWithPDF(); // Call chatWithPDF() function
    }
});
