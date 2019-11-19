const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
var fs = require('fs');


// using ejs 
app.set('view engine', 'ejs')
    // using body elements with body-parser
app.use(bodyParser.urlencoded({ extended: true }));
// using the static files & express..
app.use(express.static('public'));

// connect mongoDB with mongoose
// mongoose.connect('mongodb://localhost:27017/todolistDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
mongoose.connect('mongodb+srv://<admin-barel>:<Test-123>@cluster0-3u9t8.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// new schema create of Items
const itemsSchema = {
    name: String
};

// make new const of Item
const Item = mongoose.model('Item', itemsSchema);


// item creation
const item1 = new Item({
    name: "welcome to your todo list!"
})
const item2 = new Item({
    name: "hit the + button to add"
})
const item3 = new Item({
    name: "<---- hit here to delete"
})

// create array and push many to the db
const defaultItems = [item1, item2, item3]
    // 
const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema)


// getting the home route 
app.get('/', (req, res) => {

    Item.find({}, (err, foundItems) => {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Saved items to doc.....')
                }
            });
            res.redirect('/')
        } else {
            console.log('your list is not empty , cant add default items...')
        }
        res.render('list', { listTitle: 'Today', newListItems: foundItems });
    });

});

app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName)
            } else {
                // show if list exist
                console.log("exist already !!")
                res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
            }
        };
    });



})

app.post('/', (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item)
            foundList.save();
            res.redirect('/' + listName)
        })
    }



});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName;

    if (listName === 'Today') {
        Item.findByIdAndDelete(checkedItemId, (err) => {
            if (!err) {
                console.log('success deleted the item')
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect('/' + listName)
            }
        });
    }

});



// app.post('work', (req, res) => {
//     let item = req.body.newItem;


//     if (req.body.list === 'Work') {
//         workItems.push(item);
//         res.redirect('/work')

//     } else {
//         workItems.push(item);
//         res.redirect('/')
//     }
// })

app.listen(3000, () => {
    console.log("Server Started on port 3000!")
})