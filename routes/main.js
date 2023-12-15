//import libraries and modules
const bycrypt = require('bcrypt');  //Integrating bcrypt library
const saltRounds = 10;
const s = 10;
const { check, validationResult } = require('express-validator');

//import the DetectLanguage 
const DetectLanguage = require('detectlanguage');
const detectlanguage = new DetectLanguage('2dfbd4008071288f726fe0414980f7de'); // API key

module.exports = function(app, garageData) {

    //middleware to check if a user is logged in
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login');
        } else {
          next();
        }
    };

    //Handling routes
    //home route
    app.get('/',function(req,res){
        res.render('index.ejs', garageData);
    });

    //about route
    app.get('/about',function(req,res){
        res.render('about.ejs', garageData);
    });

    //search route
    app.get('/search',function(req,res){
        res.render("search.ejs", garageData);
    });

    //search result route
    app.get('/search-result', function (req, res) {
        //searching in the database
        let sqlquery = "SELECT * FROM tools WHERE name LIKE '%" + req.query.keyword + "%'"; //Query database to get all the tools
        //execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, garageData, {availableTools:result});
            console.log(newData);
            res.render("list.ejs", newData);  //putting newData into the ejs 
         });        
    });

    //list route with login redirection middleware
    app.get('/list', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM tools"; //query database to get all the tools
        //execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, garageData, {availableTools:result});
            console.log(newData);
            res.render("list.ejs", newData);
         });
    });

    //registration route
    app.get('/register', function (req,res) {
        res.render('register.ejs', garageData);                                                                
    });                                                                                                 
    
    //handling registration form submission 
    app.post('/registered', [
        check('email').isEmail().withMessage('Invalid email address'),
        check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        check('username').notEmpty().withMessage('Username is required'),
        check('first').notEmpty().withMessage('First name is required'),
        check('last').notEmpty().withMessage('Last name is required'),
    ], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const plainPassword = req.body.password;
            bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
                if (err) {
                    console.error('Error hashing password:', err);
                    res.send('Error registering user.');
                } else {
                    const userData = {
                        username: req.body.username,
                        first_name: req.sanitize(req.body.first),
                        last_name: req.body.last,
                        email: req.body.email,
                        hashedPassword: hashedPassword,
                    };
                    db.query('INSERT INTO users SET ?', userData, (err, result) => {
                        if (err) {
                            console.error('Error saving user to database:', err);
                            res.send('Error registering user.');
                        } else {
                            result = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.body.last + ' you are now registered!  We will send an email to you at ' + req.body.email;
                            result += 'Your password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
                            res.send(result);
                        }
                    });
                }
            });
        }
    });
    
    //login route
    app.get('/login', function (req,res) {    
        res.render('login.ejs', garageData);                                                                  
    });  

    //handling login form submission
    app.post('/loggedin', [
        check('username').notEmpty().withMessage('Username is required'),
        check('password').notEmpty().withMessage('Password is required'),
    ], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const username = req.body.username;
            const password = req.body.password;
            db.query('SELECT hashedPassword FROM users WHERE username = ?', [username], (err, results) => {
                if (err) {
                    console.error('Error querying the database:', err);
                    res.send('Error occurred during login.');
                } else {
                    if (results.length === 0) {
                        res.send('Login failed: User not found.');
                    } else {
                        const hashedPassword = results[0].hashedPassword;
                        bcrypt.compare(password, hashedPassword, function (err, result) {
                            if (err) {
                                console.log('Error comparing passwords:', err);
                                res.send('Error occurred during login.');
                            } else if (result === true) {
                                req.session.userId = req.body.username;
                                res.send('Login successful!');
                            } else {
                                res.send('Login failed: Incorrect password.');
                            }
                        });
                    }
                }
            });
        }
    });
    
    //logout route
    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./');
            }
            res.send('You are now logged out. <a href='+'./'+'>Home</a>');
        });
    });

    //fetching locations data from the database
    db.query('SELECT * FROM locations', (err, results) => {
        if (err) {
            console.error('Error querying locations:', err);
            return;
        }
        garageData.locations = results;
    });     

    //add tool route
    app.get('/addtool', function (req, res) {
        res.render('addtool.ejs', garageData);
    });

    //handling tool addition form submission
    app.post('/tooladded', [
        check('name').notEmpty().withMessage('Tool name is required'),
        check('category').notEmpty().withMessage('Category is required'),
        check('location_id').isInt().withMessage('Location ID must be an integer'),
    ], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const toolName = req.body.name;
            detectlanguage.detect(toolName).then((result) => {
                const languageData = result[0];
                if (languageData && languageData.language && languageData.language === 'en') {
                    let sqlquery = "INSERT INTO tools (name, category, location_id) VALUES (?,?,?)";
                    let newrecord = [req.body.name, req.body.category, req.body.location_id];
                    db.query(sqlquery, newrecord, (err, result) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            res.send('This tool is added to the database, name: ' + req.body.name + ' category: ' + req.body.category);
                        }
                    });
                } else {
                    res.send('Tool name is not in English. Please enter an English tool name.');
                }
            }).catch((error) => {
                console.error('Error detecting language:', error);
                res.send('Error detecting language');
            });
        }
    });

    //language detection route
    app.get('/detect-language', (req, res) => {
        const text = req.query.text || 'Hello World'; // Default text if not provided

        //use API for language detection
        detectlanguage.detect(text).then((result) => {
            const languageData = result[0];
            res.render('language-detection.ejs', { languageData });
        }).catch((error) => {
            console.error('Error detecting language:', error);
            res.render('language-detection.ejs', { languageData: null, errorMessage: 'Error detecting language' });
        });
    });

    //API route for searching tools
    app.get('/api', function (req, res) {
        //get the search keyword from the query parameters
        const keyword = req.query.keyword;
    
        //build query for keyword
        let sqlquery = keyword
            ? "SELECT * FROM tools WHERE name LIKE ?"
            : "SELECT * FROM tools";
    
        //build the SQL query parameters
        let sqlParams = keyword ? [`%${keyword}%`] : [];
    
        //execute the SQL query
        db.query(sqlquery, sqlParams, (err, result) => {
            if (err) {
                res.status(500).json({ error: 'server error' });
            } else {
                //return results as a JSON object
                res.json(result);
            }
        });
    });
};
