UoN Timetable scraper [ ![Codeship Status for ryanshawty/UoN-timetable-scraper](https://www.codeship.io/projects/ddf8b800-12a5-0132-1473-12da9d47e71d/status)](https://www.codeship.io/projects/33248)
====
Open timetable and course API. Please refer to the [license](LICENSE) for licensing information.

API Endpoints
====

Base URL
``http://uon-timetable-api.jit.su/api``

/courses
---
Get full lists of courses that exist

Example response:
```json
{
    "id":"0007951", // Course ID
    "name":"PGCE Mathematics 11 month PG (PGCE Non Standard Start) Full time/1 - X1G1 PGCE Mathematics", // Course name
    "_id":"54023dfc7946094c11ba1ad7", // Mongo ID
}
```

/courses/:id
---
Get a specific course. The ID param can be either ``id`` (course ID) or ``_id`` (Mongo ObjectID) from the above

Example response: 

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