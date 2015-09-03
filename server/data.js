// Connect to the MongoLab database.
var connection = new Mongo( "ds059692.mongolab.com:59692" );

// Connect to the test database.
var db = connection.getDB( "template" );

// Authorize this connection.
db.auth( "123", "456" );

db.students.drop();
db.events.drop();

db.students.save([
    {
        firstName : 'Davis',
        lastName  : 'Bopp',
        gender    : 'M',
        email     : 'da_bopp@gmail.com',
        cellPhone : '202-555-0117'
    },
    {
        firstName : 'Oralia',
        lastName  : 'Cully',
        gender    : 'F',
        email     : 'oralia144@hotmail.com',
        cellPhone : '202-555-0120'
    },
    {
        firstName : 'Herminia',
        lastName  : 'Pizer',
        gender    : 'F',
        email     : 'pizer.herminia@gmail.com',
        cellPhone : '202-555-0116'
    },
    {
        firstName : 'Jimmie',
        lastName  : 'Barlett',
        gender    : 'M',
        email     : 'jimmiehoang16@gmail.com',
        cellPhone : '202-555-0102'
    },
    {
        firstName : 'Delmar',
        lastName  : 'Schacht',
        gender    : 'M',
        email     : 'princeofmars01@gmail.com',
        cellPhone : '202-555-0156'
    }
]);

db.events.save([
    {
        eventName : 'Flying Angels Grand Prix Championships',
        fundedBy  : 'Flying Angels Track & Field Club',
        startDate : ISODate("2015-08-16T08:00:00.000Z"),
        endDate   : ISODate("2015-08-16T17:00:00.000Z")
    },
    {
        eventName : 'Buffalo Storm',
        fundedBy  : 'Houseshoe Tavern',
        startDate : ISODate("2015-08-16T08:00:00.000Z"),
        endDate   : ISODate("2015-08-16T17:00:00.000Z")
    },
    {
        eventName : 'Sculpt & Tone LV1 + Abs',
        fundedBy  : 'Vega Power Pilates',
        startDate : ISODate("2015-08-16T08:00:00.000Z"),
        endDate   : ISODate("2015-08-16T17:00:00.000Z")
    },
    {
        eventName : 'EM Barre 101 with Jennifer Nichols or Caryn Chapell',
        fundedBy  : 'Extension method',
        startDate : ISODate("2015-08-16T08:00:00.000Z"),
        endDate   : ISODate("2015-08-16T17:00:00.000Z")
    }
]);