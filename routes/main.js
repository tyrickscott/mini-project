const bycrypt = require('bcrypt');  //integrating bcrypt library
const saltRounds = 10;
const { check, validationResult } = require('express-validator');
module.exports = function(app, garageData) {
    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', garageData)
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
            //Hash the user's password before saving it in the database
            const plainPassword = req.body.password;
        
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
    });  

    app.post('/loggedin', function (req,res) {       
    }); 
    app.get('/logout', (req,res) => {
    })
}