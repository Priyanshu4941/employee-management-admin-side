//importing all the necessary modules
import express from "express"
import mongoose from "mongoose";
import bodyParser from "body-parser"
import session from "express-session";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();


//defining all the constant
const port1 = 8080;
const app = express();
const userid = process.env.USERID;
const password = process.env.PASSWORD;

//defining transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail', 'Yahoo', etc.
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD,
    },
});

//connecting updated Databse
mongoose.connect(process.env.DATABASELINK)
.then(()=>{
    console.log('Connected to the Database');
})
.catch(err=>{
    console.log(err);
});


//making a schema
const aluminiSchema = new mongoose.Schema({
    _id: Number,
    Password: String,
    Email: String,
    Name: String,
    Branch: String,
    PassingYear: Number,
    FirstName: String,
    LastName: String,
    Gender:String,
    Branch:String,
    Mobile:Number,
    X_BOARD:String,
    XII_BOARD:String,
    X_PERCENT:String,
    XII_PERCENT:String,
    COMPANY_1:String,
    COMPANY_2:String,
    COMPANY_3:String,
    COMPANY_4:String,
    COMPANY_5:String,
    PACKAGE_1:String,
    PACKAGE_2:String,
    PACKAGE_3:String,
    PACKAGE_4:String,
    PACKAGE_5:String,
    image: {
        data: Buffer,
        contentType: String,
      }
} ,{ collection: 'aluminidetail1s' });


//making mongoose model
const student = new mongoose.model("aluminidetail1s", aluminiSchema);


//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: 'your_secret_key', // Change this to a strong, unique secret key
        resave: false,
        saveUninitialized: false,
    })
);
app.set('view engine', 'ejs');

//handling get request
app.get("/", (req, res) => {
    res.render("adminLogin.ejs", {
        message: ""
    });
});

//handling homepage requests, authentication of the admin and the unauthorized users

app.post("/admin", (req, res) => {
    console.log(req.body);
    if (req.body.username.trim() == userid && req.body.password == password) {
        req.session.isAuthorised = true;
        res.redirect("/home");
    } else {
        res.render("adminLogin.ejs", {
            message: "Incorrect UserName or Password"
        });
    }
});

//rendering homepage
app.get("/home", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("adminMain.ejs");
    } else {
        res.redirect("/");
    }
});

app.get("/admin/find", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("AfindRoll.ejs", {
            message: ""
        });
    } else {
        res.redirect("/");
    }
});

//handling find requests according to the entered rollno
app.post("/admin/find", (req, res) => {
    if (req.session.isAuthorised) {
        if (req.body.rollno == "") {
            res.redirect("/admin/find");
        } else {
            console.log(req.body);
            var Roll = parseInt(req.body.rollno);
            console.log(Roll);
            student.find({ _id: Roll })
                .then(details => {
                    if (details.length == 0) {
                        res.render("AfindRoll.ejs", {
                            message: "No Such User Exists"
                        });
                    } else {

                        // console.log(details[0]);
                        res.render("Ainfo.ejs", {
                            sdetails: details,
                            name: details[0].Name,
                            route: "/admin/find"
                        })
                    }

                })
                .catch(err => {
                    //console.log(err);
                    res.redirect("/admin/find");
                })
        }
    } else {
        res.redirect("/");
    }
});


//handling branch  page
app.get("/admin/findBranch", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("AfindBranch.ejs");
    } else {
        res.redirect("/");
    }
});

//handling search by branch details
app.post("/admin/findBranch/branch", (req, res) => {
    if (req.session.isAuthorised) {
        console.log(req.body);
        var branch = (req.body.branch);
        console.log(branch);
        student.find({ Branch: branch })
            .then(details => {
                //console.log(details);
                res.render("Ainfo.ejs", {
                    sdetails: details,
                    name: details[0].Branch,
                    route: "/admin/findBranch"
                })
            })
            .catch(err => {
                console.log(err);
                res.redirect("/admin/findBranch");
            })
    } else {
        res.redirect("/");
    }

});
//handling passing year  page
app.get("/admin/findYear", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("AfindYear.ejs");
    } else {
        res.redirect("/");
    }
});
//handling search by passing year details
app.post("/admin/findYear/passingYear", (req, res) => {
    if (req.session.isAuthorised) {
        console.log(req.body);
        var passingYear = (req.body.passingYear);
        // console.log(branch);
        student.find({ PassingYear: passingYear })
            .then(details => {
                //console.log(details);
                res.render("Ainfo.ejs", {
                    sdetails: details,
                    name: details[0].PassingYear,
                    route: "/admin/findYear"
                })
            })
            .catch(err => {
                console.log(err);
                res.redirect("/admin/findYear");
            })
    } else {
        res.redirect("/");
    }
});


//handling namesearches pages
app.get("/admin/findName", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("AfindName.ejs", {
            message: ""
        });
    } else {
        res.redirect("/");
    }
});
//handling namesearch page data
app.post("/admin/findName/name", (req, res) => {
    if (req.session.isAuthorised) {
        console.log(req.body);
        var name = (req.body.name).toUpperCase().trim();
        const regex = new RegExp(name, 'i');
        student.find({ Name: { $regex: regex } })
            .then(details => {
                //console.log(details);
                if (details.length == 0) {
                    res.render("AfindName.ejs", {
                        message: "No Such User Exists"
                    });
                } else {
                    res.render("Ainfo.ejs", {
                        sdetails: details,
                        name: name,
                        route: "/admin/findName"
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.redirect("/admin/findName");
            })

    } else {
        res.redirect("/");
    }
});
app.post("/admin/findName/fName", (req, res) => {
    if (req.session.isAuthorised) {
        console.log(req.body);
        var name = (req.body.name).toUpperCase().trim();
        console.log(name);
        student.find({ FirstName: name })
            .then(details => {
                //console.log(details);
                if (details.length == 0) {
                    res.render("AfindName.ejs", {
                        message: "No Such User Exists"
                    });
                } else {
                    res.render("Ainfo.ejs", {
                        sdetails: details,
                        name: name,
                        route: "/admin/findName"
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.redirect("/admin/findName");
            })
    } else {
        res.redirect("/");
    }
});


//handling addnewuser get request
app.get("/addNewUser", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("AcreateUser.ejs", {
            message: ""
        });
    } else {
        res.redirect("/");
    }
});


//saving details of new user
app.post("/uploadInfo", (req, res) => {
    if (req.session.isAuthorised) {
        student.find({ _id: parseInt(req.body.rollNo) })
            .then(detail => {
                if (detail.length === 0) {
                    var newuser = new student({
                        _id: parseInt(req.body.rollNo),
                        Name: (req.body.fname.trim() + " " + req.body.lname.trim()).toUpperCase(),
                        Branch: req.body.branch,
                        Email: (req.body.email),
                        FirstName: (req.body.fname).toUpperCase().trim(),
                        LastName: (req.body.lname).toUpperCase().trim(),
                        PassingYear: parseInt(req.body.PassingYear),
                        Gender:req.body.Gender,
                        X_PERCENT:req.body.X_PERCENT,
                        XII_PERCENT:req.body.XII_PERCENT,
                    });
                    newuser.save();
                    console.log("New user Added");
                    res.render("AcreateUser.ejs", {
                        message: "New User Added"
                    });
                } else {
                    res.render("userexits.ejs");
                }
            })
    } else {
        res.redirect("/");
    }
});


//handling mail options
app.get("/mail", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("notAvalaible.ejs");
    } else {
        res.redirect("/");
    }
})
//handling mailing options
app.get("/mailCatagory", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("mailBranch.ejs");
    } else {
        res.redirect("/");
    }
});
app.post("/mailBranch", (req, res) => {
    if (req.session.isAuthorised) {
        req.session.mailBranch = req.body.Year;
        res.render("sendMail.ejs");
    } else {
        res.redirect("/");
    }
});


app.get("/uploadInfo",(req,res)=>{
    if(req.session.isAuthorised){
        res.render("AuploadInfo.ejs");
    }else{
        res.redirect("/");
    }
});




//notice board code starts here

const storage = multer.memoryStorage();
const upload = multer({ storage });


const Document = mongoose.model('Document', {
    name: String,
    data: Buffer,
});


//handling notice upload get requests
app.get("/uploadNotice",(req,res)=>{
    if(req.session.isAuthorised){
        res.render("noticeUpload.ejs");
    }else{
        res.redirect("/");
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    if(req.session.isAuthorised){

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
    
        const fileName = req.file.originalname;
        const fileBuffer = req.file.buffer;
    
        const document = new Document({ name: fileName, data: fileBuffer });
    
        document
            .save()
            .then(() => {
                console.log('Document uploaded successfully. ' + fileName);
                res.redirect('/downloadNotice');
            })
            .catch((error) => {
                console.error('Error saving document:', error);
                res.status(500).send('Error uploading the document.');
            });
    }else{
        res.redirect("/");
    }
});

app.get('/downloadNotice', (req, res) => {
    if(req.session.isAuthorised){
        Document.find()
            .then((documents) => {
                res.render('noticeDownload.ejs', { documents });
            })
            .catch((error) => {
                console.error('Error fetching documents:', error);
                res.status(500).send('Error fetching documents.');
            });

    }else{
        res.redirect("/");
    }
});

app.get('/download/:id', (req, res) => {
    if(req.session.isAuthorised){
        const documentId = req.params.id;
    
        Document.findById(documentId)
            .then((document) => {
                if (!document) {
                    return res.status(404).send('Document not found.');
                }
    
                res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(document.data);
            })
            .catch((error) => {
                console.error('Error fetching document:', error);
                res.status(500).send('Error fetching document.');
            });

    }else{
        res.redirect("/");
    }
});

app.get('/deleteNotice', (req, res) => {
    if(req.session.isAuthorised){

        Document.find()
            .then((documents) => {
                res.render('noticeDelete.ejs', { documents });
            })
            .catch((error) => {
                console.error('Error fetching documents:', error);
                res.status(500).send('Error fetching documents for deletion...');
            });
    }else{
        res.redirect("/");
    }
});

app.get('/delete/:id', (req, res) => {
    if(req.session.isAuthorised){
        const documentId = req.params.id;
    
        Document.findByIdAndRemove(documentId)
            .then((deletedDocument) => {
                if (!deletedDocument) {
                    return res.status(404).send('Document not found.');
                }
    
                console.log('Document deleted successfully. ' + documentId);
                res.redirect('/deleteNotice');
            })
            .catch((error) => {
                console.error('Error deleting document:', error);
                res.status(500).send('Error deleting document.');
            });

    }else{
        res.redirect("/");
    }
});

//notice board code ends here


// handeling requests for job - internship updates

const jobDocuments = mongoose.model('jobDocuments', {
    name: String,
    data: Buffer,
});

app.get("/job-internship-updates",(req,res)=>{
    if(req.session.isAuthorised){
        jobDocuments.find()
        .then((documents) => {
            res.render('jobDocuments.ejs', { documents });
        })
        .catch((error) => {
            console.error('Error fetching documents:', error);
            res.status(500).send('Error fetching documents.');
        });
    }
    else{
        res.redirect("/");
    }
});


app.get('/job-internship-updates/:id', (req, res) => {
    if(req.session.isAuthorised){
        const documentId = req.params.id;
    
        jobDocuments.findById(documentId)
            .then((document) => {
                if (!document) {
                    return res.status(404).send('Document not found.');
                }
                // console.log(document);
                res.set('Content-Disposition', `attachment; filename="${document.name}"`);
                res.set('Content-Type', 'application/octet-stream');
                res.send(document.data);
            })
            .catch((error) => {
                console.error('Error fetching document:', error);
                res.status(500).send('Error fetching document.');
            });
    }else{
        res.redirect("/");
    }
});

// delete job-internship-documents

app.get('/job-internship-updates-delete', (req, res) => {
    if(req.session.isAuthorised){

        jobDocuments.find()
            .then((documents) => {
                res.render('jobDocumentDelete.ejs', { documents });
            })
            .catch((error) => {
                console.error('Error fetching documents:', error);
                res.status(500).send('Error fetching documents for deletion...');
            });
    }else{
        res.redirect("/");
    }
});

app.get('/job-internship-updates-delete/:id', (req, res) => {
    if(req.session.isAuthorised){
        const documentId = req.params.id;
    
        jobDocuments.findByIdAndRemove(documentId)
            .then((deletedDocument) => {
                if (!deletedDocument) {
                    return res.status(404).send('Document not found.');
                }
    
                console.log('Document deleted successfully. ' + documentId);
                res.redirect('/job-internship-updates-delete');
            })
            .catch((error) => {
                console.error('Error deleting document:', error);
                res.status(500).send('Error deleting document.');
            });

    }else{
        res.redirect("/");
    }
});


app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
        } else {
            res.redirect("/"); // Redirect to the login page
        }
    });
});

app.listen(process.env.PORT || port1, () => {
    console.log(`Server started on port ${port1}`);
});

