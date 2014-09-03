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

/courses/:id
---
Get a specific course. The ID param is the course ID from above

### Example request:

GET /courses/0219123?type=csv - download the data as CSV

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

To start the application:
```
nf start
```

NOTE: This application requires a connection to a database, instruction will be here soon.
