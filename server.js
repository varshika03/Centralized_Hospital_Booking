const express = require('express')
const hbs = require('hbs')
var bodyParser = require('body-parser')

var current_id="";
var current_hospital=-1;
var current_doctor=-1;
var current_admin=-1;
var current_appointment={
    Patient_first:"",
    Patient_last:"",
    hname:"",
    dname:"",
    hid:"",
    did:"",
    date:"",
    time:""
};
var app = express();

  app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// //use database
 var conn = require('./Database/connection'); 
 
conn.getConnection(
            function (err, client) {
            	
                client.query("use db", function(err, rows) {
                    // And done with the connection.
                    if(err){
                        console.log(error);
                    }

                  
                    client.release();

                    // Don't use the connection here, it has been returned to the pool.
                });

        });   
app.set('view engine','hbs');

app.get('/',(req,res)=>{
    current_id="";
 current_hospital=-1;
 current_doctor=-1;
 current_admin=-1;
	res.render('first.hbs');
});


////////////////////////////PATIENT/////////////////////////////////////////////////////////////////////////
app.get('/patient',(req,res)=>{
	res.render('patient_sr.hbs');
});

app.get('/patient_register',(req,res)=>{
	res.render('patient_register.hbs');
});

app.get('/patient_login',(req,res)=>{
    res.render("patient_login.hbs");
})
app.post('/patient_registered',(req,res)=>{
  conn.getConnection(
    function (err, client) {
            //insert check for inserting unique email ids
            	 var sql=`Insert into patient Values("${req.body.firstname}","${req.body.lastname}","${req.body.age}","${req.body.gender}","${req.body.BirthDate}","${req.body.address}","${req.body.email}","${req.body.number}","${req.body.password}")`;
console.log(sql);
                client.query(sql, function(err, rows) {
                    // And done with the connection.
                    if(err){
                        console.log(error);
                    }

                  
                    client.release();

                    // Don't use the connection here, it has been returned to the pool.
                });

        });   
  res.render("patient_login.hbs");

});
app.get('/patient_page',(req,res)=>{
    if(current_hospital!=-1)
        res.render("patient_page.hbs");
    else
        res.send("Login first");
});
app.post('/patient_page',(req,res)=>{
  conn.getConnection(
            function (err, client) {
            	var sql=`Select password from patient where email = "${req.body.email}"`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                	console.log(rows[0].password);
                    // And done with the connection.
                    if(err | req.body.password!=rows[0].password ){
                        res.send("Invalid email id or password!")
                    }
                    else
                    {
                    	current_id=req.body.email;
                       sql=`Select FirstName,LastName from patient where email = "${req.body.email}"`;
                client.query(sql, function(err, rows) {
                    console
                     current_appointment.Patient_first=rows[0].FirstName;
                     current_appointment.Patient_last=rows[0].LastName;	 
                    });
                    res.render("patient_page.hbs");
                }
                  
                    client.release();
                });

                    // Don't use the connection here, it has been returned to the pool.
                });

        


	
});

app.get('/hospital_type',(req,res)=>{
res.render('hospital_type.hbs');
});

app.post('/select_hospital',(req,res)=>{
    conn.getConnection(
            function (err, client) {
                console.log(req.body);
                var sql=`Select name from hospital where type = "${req.body.type}"`;
                client.query(sql, function(err, rows) {
                    if(err)
                        console.log(err);
                    else{
                    console.log(rows);
                    //var t =JSON.stringify(rows);
	res.render("select_hospital.hbs",{
        dropdown:rows
    });
}
client.release();
});
});
});

app.post('/select_doctor',(req,res)=>{
    console.log(req.body.hospital);
    current_appointment.hname=req.body.hospital;
    conn.getConnection(
            function (err, client) {
                var sql=`Select hid from hospital where name = "${req.body.hospital}"`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                    console.log(rows);
                    current_appointment.hid=rows[0].hid;
                    sql=`Select d.did,d.name as doctor,dept.name as department,d.fee from doctor d,department dept where d.hid = ${rows[0].hid} and dept.id=d.dept`;
                    client.query(sql, function(err1, rows1) {
console.log(sql);
console.log(rows1);
                    //var t =JSON.stringify(rows);
    res.render("select_doctor.hbs",{
        details:rows1
    });
});
});
                client.release();
            });
});

app.post('/date_time',(req,res)=>{
    current_appointment.did=req.body.doctor;

    conn.getConnection(
            function (err, client) {
                var sql=`Select name from doctor where did = ${req.body.doctor}`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                    current_appointment.dname=rows[0].name;
                });
                client.release();
            });
           

    res.render("date_time.hbs");
});

app.post('/receipt',(req,res)=>{
    current_appointment.date=req.body.date;
    current_appointment.time=req.body.time;
    console.log(current_appointment);

    conn.getConnection(
            function (err, client) {
                var sql=`Insert into appointment values("${current_id}",${current_appointment.did},${current_appointment.hid},"${current_appointment.date}","${current_appointment.time}","${current_id}")`;
                console.log(sql);
                client.query(sql, function(err, rows) {

    res.render("receipt.hbs",{
        receipt:current_appointment
    });
});
                client.release();
            });
});

app.get('/update_profile',(req,res)=>{
     conn.getConnection(
            function (err, client) {
                if(current_id!='')
                {
                var sql=`Select * from patient where email="${current_id}" `;
                console.log(sql);
                client.query(sql, function(err, rows) {
                if(err)
                    console.log(err);
                else
                    res.render("update_profile.hbs",{
                        details:rows[0]

                    });
            });
            }
                else
                {
                    res.send("Login first");
                }
});
 });

app.post('/profile_updated',(req,res)=>{
     conn.getConnection(
            function (err, client) {
                var sql=`Update patient set FirstName="${req.body.firstname}",LastName="${req.body.lastname}",age="${req.body.age}",Address="${req.body.address}",contact="${req.body.number}" where email = "${current_id}"`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                if(err)
                    console.log(err);
                else
                    res.render("patient_page.hbs");
            });
            
  
});
 });

app.get('/update_password',(req,res)=>{
    if(current_id!="")
    res.render("update_password.hbs");
else
    res.send('Login first');
});

app.post('/password_updated',(req,res)=>{
    conn.getConnection(
            function (err, client) {
                var sql=`Select password from patient where email = "${current_id}"`;
                client.query(sql, function(err, rows) {
                if(err )
                    console.log(err);
                else if (req.body.Current != rows[0].password)
                {
                    console.log(req.body.Current);
                    console.log(rows);
                    res.send("Invalid password");
                }
                else
                {
                   conn.getConnection(
            function (err, client) {
                var sql=`Update patient set password="${req.body.new}" where email = "${current_id}"`;
                client.query(sql, function(err, rows) {
                    res.render("password_updated.hbs");
                });
            });
                
            }
               
            
  
});
});

});

app.get('/view_appointments',(req,res)=>{
    if(current_id=="")
        res.send("Login First");
    else
    {
        conn.getConnection(
            function (err, client) {
                var sql=`Select p.FirstName,p.LastName,h.name as Hospital,d.name as Doctor,date, time from patient p,hospital h,doctor d,appointment a where a.patient_id = "${current_id}" and p.email="${current_id}"   and a.hid = h.hid and a.did = d.did`;
                client.query(sql, function(err, rows) {
                if(err )
                    console.log(err);
                else
                {
                    res.render("view_appointments.hbs",{
                        appointments:rows
                    });
                }
            });
            });
    }

});









/////////////////////////////////////////////////HOSPITAL/////////////////////////////////////////////////////
app.get('/hospital_login',(req,res)=>{
    res.render("non_patient/hospital_login.hbs");
});

app.get('/hospital_page',(req,res)=>{
    if(current_hospital!=-1)
        res.render("non_patient/hospital_page.hbs");
    else
        res.send("Login first");
});

app.post('/hospital_page',(req,res)=>{
  conn.getConnection(
            function (err, client) {
                console.log(req.body.id);
                var sql=`Select password from hospital where hid = ${req.body.id}`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                    console.log(rows[0].password);
                    // And done with the connection.
                    if(err | req.body.password!=rows[0].password ){
                        res.send("Invalid email id or password!")
                    }
                    else
                    {
                        current_hospital=req.body.id;
                    res.render("non_patient/hospital_page.hbs");
                }
                  
                    client.release();
                });

                    // Don't use the connection here, it has been returned to the pool.
                });

        


    
});

app.get('/view_profile',(req,res)=>{
    if(current_hospital==-1)
    {
      res.send("Login first");
    }
    else
    {
  conn.getConnection(
            function (err, client) {
                var sql=`Select * from hospital where hid = ${current_hospital}`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                    
                  res.render("non_patient/hospital_profile.hbs",{
                    details:rows[0]
                  });
                    client.release();
                });

                    // Don't use the connection here, it has been returned to the pool.
                });
}

    });

app.get('/update_hospital_password',(req,res)=>{
    if(current_hospital!=-1)
    res.render("non_patient/hospital_update_password.hbs");
else
    res.send('Login first');
});

app.post('/hospital_password_updated',(req,res)=>{
    conn.getConnection(
            function (err, client) {
                var sql=`Select password from hospital where hid = ${current_hospital}`;
                client.query(sql, function(err, rows) {
                if(err )
                    console.log(err);
                else if (req.body.Current != rows[0].password)
                {
                    console.log(req.body.Current);
                    console.log(rows);
                    res.send("Invalid password");
                }
                else
                {
                   conn.getConnection(
            function (err, client) {
                var sql=`Update hospital set password="${req.body.new}" where hid = ${current_hospital}`;
                client.query(sql, function(err, rows) {
                    res.render("non_patient/hospital_password_updated.hbs");
                });
            });
                
            }
               
            
  
});
});

});

app.get('/update_hospital_profile',(req,res)=>{
     conn.getConnection(
            function (err, client) {
                if(current_hospital!=-1)
                {
                var sql=`Select * from hospital where  hid = ${current_hospital}`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                if(err)
                    console.log(err);
                else
                    res.render("non_patient/hospital_update_profile.hbs",{
                        details:rows[0]

                    });
            });
            }
                else
                {
                    res.send("Login first");
                }
});
 });

app.post('/hospital_profile_updated',(req,res)=>{
     conn.getConnection(
            function (err, client) {
                var sql=`Update hospital set name="${req.body.name}",type="${req.body.type}",address="${req.body.address}",Contact="${req.body.Contact}" where hid = ${current_hospital}`;
                console.log(sql);
                client.query(sql, function(err, rows) {
                if(err)
                    console.log(err);
                else
                    res.render("non_patient/hospital_page.hbs");
            });
            
  
});
 });

app.get('/hospital_view_appointments',(req,res)=>{
    if(current_hospital==-1)
        res.send("Login First");
    else
    {
        conn.getConnection(
            function (err, client){

                var sql=`Select p.FirstName,p.LastName,d.name as Doctor,date, time from patient p,doctor d, hospital h,appointment a where a.hid = ${current_hospital} and a.did = d.did and a.email = p.email and h.hid = ${current_hospital}`;
                client.query(sql, function(err, rows) {
                if(err )
                    console.log(err);
                else
                {
                    res.render("non_patient/hospital_view_appointments.hbs",{
                        appointments:rows
                    });
                }
            });
            });
    }

});


app.get('/hospital_view_doctors',(req,res)=>{
    if(current_hospital==-1)
        res.send("Login First");
    else
    {
        conn.getConnection(
            function (err, client){

                var sql=`Select d.did,d.name as doctor,dept.name as department,d.fee from doctor d, department dept where d.dept=dept.id and d.hid=${current_hospital} order by d.did`;
                client.query(sql, function(err, rows) {
                if(err )
                    res.send(err);
                else
                {
                    res.render("non_patient/hospital_view_doctors.hbs",{
                        doctors:rows
                    });
                }
            });
            });
    }



});

app.get('/hospital_add_doctors',(req,res)=>{
if(current_hospital==-1)
        res.send("Login First");
    else
    {
    
        conn.getConnection(
            function (err, client){

                var sql=`Select * from department`;
                client.query(sql, function(err, rows) {
                if(err )
                    res.send(err);
                else
                {
                    res.render("non_patient/hospital_add_doctors.hbs",{
                        dropdown:rows
                    });
                }
            });
            });
    }

});

app.post('/doctorsAdded',(req,res)=>{

  conn.getConnection(
            function (err, client){

                var sql=`Insert into doctor values(${req.body.did},"${req.body.name}",${req.body.department},${req.body.fee},${current_hospital},"${req.body.password}")`;
                client.query(sql, function(err, rows) {
                if(err )
                    res.send(err);
                else
                {
                    res.render("non_patient/hospital_page.hbs");
                }
            });
            });
});

app.get('/hospital_remove_doctors',(req,res)=>{

conn.getConnection(
            function (err, client){

                var sql=`Select d.did,d.name as doctor,dept.name as department,d.fee from doctor d, department dept where d.dept=dept.id and d.hid=${current_hospital} order by d.did`;
                client.query(sql, function(err, rows) {
                if(err )
                    res.send(err);
                else
                {
                    res.render("non_patient/hospital_doctor_remove.hbs",{
                        details:rows
                    });
                }
            });
            });

    
});

app.post('/confirm_doctor_removal',(req,res)=>{

conn.getConnection(
            function (err, client){

                var sql=`Delete from doctor where did = ${req.body.doctor}`;
                client.query(sql, function(err, rows) {
                if(err )
                    console.log(err);
                else
                {
                    res.render("non_patient/hospital_page.hbs",{
                        details:rows
                    });
                }
            });
            });
});

app.listen(3000,()=>
	{
		console.log('Server is up');
	});