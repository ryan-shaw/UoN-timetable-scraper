UoN Timetable scraper [ ![Codeship Status for ryanshawty/UoN-timetable-scraper](https://www.codeship.io/projects/ddf8b800-12a5-0132-1473-12da9d47e71d/status)](https://www.codeship.io/projects/33248)
====
Open timetable and course API. Please refer to the [license](LICENSE) for licensing information.

API Endpoints
====

Base URL
``http://uon-timetable-api.jit.su/api``

/courses/:search
---
Get full lists of courses that contain ``search`` text, will response with an error if search term length below 3

### Example response:
```json
{
    "id":"0007951", // Course ID
    "name":"PGCE Mathematics 11 month PG (PGCE Non Standard Start) Full time/1 - X1G1 PGCE Mathematics", // Course name
}
```

/courses/modules/:id
---
Get a specific course. The ID param is the course ID from above

### Example request:

GET /courses/modules/0219123?type=csv - download the data as CSV

The type parameter is optional, if not specified or not ``csv`` it will be passed back as ``json``

### Example response: 

```json
{  
   "name":"PGCE Mathematics 11 month PG (PGCE Non Standard Start) Full time/1 - X1G1 PGCE Mathematics",
   "days":[  
      {  
         "modules":[  
            {  
               "code":"XX4TT2/L1/01",
               "name":"The History ot the UK Education System and Curriculum",
               "type":"Lecture",
               "time":{  
                  "start":"9:00",
                  "end":"10:00"
               },
               "room":"JC-EXCHGE-D.LT3+",
               "weeks":[  
                  "1"
               ]
            }// ... etc
         ],
         "day_name":"Monday"
      } // Repeat Tuesday - Friday
   ]
}
```

/courses/modules/:username
---
Get course details for a specific username

### Example request
GET /courses/modules/username/psyrs6

### Example response
```json
{  
   "name":"Software Engineering 3 year UG Full time/3 - G601 BSc Hons Software Engineering",
   "school":"000133",
   "id":"0219123",
   "_id":"541d59621c693d1419b6cb49",
   "__v":0
}
```

/module/:code
---
Get module times for a specific module

### Example request
GET /module/G52CPP

### Example response
```json
[  
   {  
      "day_name":"Monday",
      "modules":[  

      ]
   },
   {  
      "day_name":"Tuesday",
      "modules":[  
         {  
            "weeks":[  
               19,20,21,22,23,24,25,26,27,32,33
            ],
            "staff":"Atkin J Dr",
            "room":"JC-EXCHGE-D.LT3+",
            "time":{  
               "end":"17:00","start":"16:00"
            },
            "type":"Lecture",
            "name":"C++ Programming",
            "code":"G52CPP"
         }
      ]
   },
   {  
      "day_name":"Wednesday",
      "modules":[  

      ]
   },
   {  
      "day_name":"Thursday",
      "modules":[  
         {  
            "weeks":[  
               19,20,21,22,23,24,25,26,27,32,33
            ],
            "staff":"Atkin J Dr",
            "room":"JC-EXCHGE-C.LT2+",
            "time":{  
               "end":"13:00","start":"12:00"
            },
            "type":"Lecture",
            "name":"C++ Programming",
            "code":"G52CPP"
         }
      ]
   },
   {  
      "day_name":"Friday",
      "modules":[  
         {  
            "weeks":[  
               19,20,21,22,23,24,25,26,27,32,33
            ],
            "staff":"Atkin J Dr",
            "room":"JC-BSSOUTH-B52+",
            "time":{  
               "end":"15:00","start":"14:00"
            },
            "type":"Lecture",
            "name":"C++ Programming",
            "code":"G52CPP"
         },
         {  
            "weeks":[  
               20,21,22,23,24,25,26,27,"32"
            ],
            "staff":"Atkin J Dr",
            "room":"JC-COMPSCI-A32",
            "time":{  
               "end":"16:00","start":"15:00"
            },
            "type":"Computing",
            "name":"C++ Programming",
            "code":"G52CPP"
         }
      ]
   }
]
```

/staff
---
Get details about a staff member
Query parameters: name=Steve&department=Computer Science

### Example request
GET /staff?name=Nilsson%20H%20Dr&department=Computer%20Science

### Example response
```json
{  
   "short":"Nilsson H Dr",
   "department":"Computer Science",
   "email":"henrik.nilsson@nottingham.ac.uk",
   "username":"psznhn",
   "_id":"541ed70b175f520000259192",
   "__v":0
}
```

/room/:room
---
Get details about a room

### Example request
GET /room/JC-EXCHGE-C3

### Example response
```json
{  
   "code":"JC-EXCHGE",
   "name":"Jubilee Campus The Exchange Building C3",
   "_id":"541e9ed8e4524744172efa58",
   "__v":0
}
```

Contributing
---
To contribute to this project you will need to first fork this project, this can be done via the Github web interface. Learn more here https://help.github.com/articles/fork-a-repo

Once added to your Github account, clone the repo to your local machine. You will then need to install the following:
```code
npm install grunt-cli -g
npm install bower -g
npm install foreman -g
```
You might need to be administrator to do so: 

```
sudo npm...
```

You will need to have ruby installed. This comes pre shipped with Mac OSX, other OS's how-tos can be found [here](https://www.ruby-lang.org/en/installation/).

Then install this gem:

```code
gem install sass
```

Once completed run ``npm install && bower install`` in the root directory to install all dependencies.

### Read only database connection

This application requires a database connection. There is a read only user set on the database which you may use. 

Step 1: Create a file called ``.env`` in the root directory 

Step 2: Add ``mongodb://uon-readonly:readonly@kahana.mongohq.com:10082/programmes`` to the ``.env`` file

Step 3: Run ```nf start```
