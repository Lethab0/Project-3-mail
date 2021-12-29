document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById("button1").onclick = read_form;
  

  // By default, load the inbox
  load_mailbox('inbox');

  

})


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //fetch for the che chosen mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    let arrayLength = emails.length;
    for (var i = 0; i < arrayLength; i++) {
      // Create a division for each email
      let mail_section = document.createElement("div")

      // style the div
      
      let sender = document.createElement("h3");
      sender.innerHTML = emails[i].sender;
      let subject = document.createElement("h3");
      subject.innerHTML = emails[i].subject;
      let time = document.createElement("h3");
      time.innerHTML = emails[i].timestamp;
       
      // if it was read alter the div color
      if (emails[i].read === true) {
        mail_section.style.backgroundColor = 'grey' ;
      } else {
        mail_section.style.backgroundColor = 'white' ;
      };

      //Adding the emali to the html page
      mail_section.appendChild(sender);
      mail_section.appendChild(subject);
      mail_section.appendChild(time);

      

      // adding a button to be able to archive an email 
      let current_mail = emails[i];
       
      /// This is to lead to the view that shows the entire email whenever the email div is clicked
      subject.onclick = () => {
        View_mail(current_mail);
      }
     
      if (mailbox === 'inbox' && emails[i].archived === false) {
        let archive_button = document.createElement("button") ;
        archive_button.innerHTML = 'Archive';
        archive_button.id = 'archive';
        mail_section.appendChild(archive_button);

        archive_button.onclick = () => {
           archives(current_mail);
        }

        //Being able to unarchive an email
 
      } else if (mailbox === 'archive' && emails[i].archived === true) {
        let archive_button = document.createElement("button") ;
        archive_button.innerHTML = 'Unarchive';
        archive_button.id = 'archive';
        mail_section.appendChild(archive_button); 
        
        archive_button.onclick = () => {
          archives(current_mail); 
        } 
      
      }
      document.getElementById("emails-view").appendChild(mail_section);  
   

      }
    
      
    

  });
}


function Send_mail() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: 'baz@example.com',
        subject: 'Meeting time',
        body: 'How about we meet tomorrow at 3pm?'
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
    
    
}

function archives(mail) {

  fetch(`/emails/${mail.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !mail.archived
    })
  })

  load_mailbox('inbox');
}


//Sending an email
function read_form(){
  document.querySelector('form').onsubmit = function(){
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
    load_mailbox('inbox');
};
}

function reply(email){
  //loading the compose page
  compose_email();

  //Adding a receiver which is the original sender
  document.querySelector('#compose-recipients').value = email.sender;
  
  // Addding the subject to the compose
  let str = email.subject
  if (str.slice(0, 2) !== 'Re') {
    document.querySelector('#compose-subject').value = 'Re: '+ str;  
  } else {
    document.querySelector('#compose-subject').value = str;
  }
  
  // prefilling the body of the email 
  document.querySelector('#compose-body').value = '';
}



//// Viewing the entire email after it is clicked
function View_mail(mail) {
  /// getting the selected mail
  fetch(`/emails/${mail.id}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
      console.log(emails);

    // ... do something else with emails 
    /// Clear everything for a empty block
  document.querySelector('#emails-view').innerHTML = '';

  // creating the reply button
  let reply_button = document.createElement("button");
  reply_button.innerHTML = 'Reply';
  reply_button.className = "btn btn-sm btn-outline-primary";
  reply_button.onclick = () => {
    reply(emails)
  };
  /// add infromation from the email
  let fullmail = document.createElement("div");
   
  fullmail.innerHTML = `<h3> From : ${emails.sender} </h3>
                        <h3> To : ${emails.recipients} </h3>
                        <h3> Subject : ${emails.subject} </h3>
                        <h3> Timestamp : ${emails.timestamp} </h3>`;

  fullmail.appendChild(reply_button);
  
  let body = document.createElement("div");

  body.innerHTML = `<Hr>
                    <h4> ${emails.body} </h4>`;

  fullmail.append(body); 

  document.querySelector('#emails-view').appendChild(fullmail); 

  });

  //// marking the email as read
  fetch(`/emails/${mail.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
}