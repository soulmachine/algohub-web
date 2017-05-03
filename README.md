# Website for algohub.org


## How to run

    export MAIL_URL="smtp://postmaster%40mg.algohub.org:189943991fa36d10ccc0145a82f7b996@smtp.mailgun.org:587"
    # export MONGO_URL="mongodb://algohub.org:27017/algohub"
    export MONGO_URL="mongodb://algohub:fkLQuCh3M@algohub-shard-00-00-vwc3c.mongodb.net:27017,algohub-shard-00-01-vwc3c.mongodb.net:27017,algohub-shard-00-02-vwc3c.mongodb.net:27017/algohub?ssl=true&replicaSet=AlgoHub-shard-0&authSource=admin"
    meteor --settings settings.json
