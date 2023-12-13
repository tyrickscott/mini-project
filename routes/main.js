const bycrypt = require('bcrypt');  //integrating bcrypt library
const saltRounds = 10;
const s = 10;
const { check, validationResult } = require('express-validator');
module.exports = function(app, garageData) {

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    };

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', garageData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', garageData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", garageData);
    });

    app.get('/search-result', function (req, res) {
        //searching in the database
        let sqlquery = "SELECT * FROM tools WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the tools
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, garageData, {availableTools:result});
            console.log(newData)
            res.render("list.ejs", newData)  //putting newData into the ejs 
         });        
    });

    app.get('/list', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM tools"; // query database to get all the tools
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, garageData, {availableTools:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    app.get('/register', function (req,res) {
        res.render('register.ejs', garageData);                                                                
    });                                                                                                 
    app.post('/registered', [check('email').isEmail(), 
    check('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long')],
     function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register');
        }
        else {
            const plainPassword = req.body.password; //Hash the user's password before saving it in the database
        
            bycrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                //Store hashed password in database
                if (err) {
                    console.error('Error hashing password:' , err);
                    res.send('Error registering user.');
                } 
                else {
                    //Store the user's information in the database
                    const userData = {
                        username: req.body.username,
                        first_name: req.sanitize(req.body.first),
                        last_name: req.body.last,
                        email: req.body.email,
                        hashedPassword: hashedPassword, 
                    };
                    // saving data in database
                    db.query('INSERT INTO users SET ?' , userData, (err, result) => {
                        if (err) {
                            console.error('Error saving user to database:', err);
                            res.send('Error registering user.');
                        }
                        else {
                            result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
                            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                            res.send(result);
                        }
                    });
            
                }  
            });
        }                                                                      
    });
    app.get('/login', function (req,res) {    
        res.render('login.ejs', garageData);                                                                  
    });  

    app.post('/loggedin', function (req,res) {
        const username = req.body.username;
        const password = req.body.password;    
        
        //Query the database to retrieve the hashed password for the provided username
        db.query('SELECT hashedPassword FROM users WHERE username = ?' , [username], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                res.send('Error occured during login.');
            }
            else {
                if (results.length === 0) {
                    res.send('Login failed: User not found.');
                }
                else {
                    //accesses the first (and in this case, the only) element in the results array. Since we are querying the database for a specific username, we expect only one row of data to be returned.
                    const hashedPassword = results[0].hashedPassword;

                    //Compare the provided password with the hashed password from the database
                    bycrypt.compare(password, hashedPassword, function (err, result) {
                        if (err) {
                            console.log('Error comparing passwords:', err);
                            res.send('Error occured during login.');
                        }
                        else if (result === true) {
                            // Save user session here, when login is successful
                            req.session.userId = req.body.username;
                            //Successful login
                            res.send('Login successful!');
                        }
                        else {
                            //Incorrect password
                            res.send('Login failed: Incorrect password.');
                        }
                    });
                }
            }
        })
    }); 

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    });

    app.get('/addtool', function (req, res) {
        res.render('addtool.ejs', garageData);
     });

     app.post('/tooladded', function (req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO tools (name, category) VALUES (?,?)";
        // execute sql query
        let newrecord = [req.body.name, req.body.category];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
            return console.error(err.message);
            }
            else
            res.send(' This tool is added to database, name: '+ req.body.name + ' category: '+ req.body.category);
            });
    });    
}