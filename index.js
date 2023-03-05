const express = require('express')

var bodyParser = require('body-parser')
const Joi = require('joi');
const app = express()
app.use(bodyParser.json());
const port = 3000 
app.listen(port, () => {
  console.log("node_ds app listening on port" ,port)
})

const file=__dirname+"/"+"students.json"
// allows you to work with the file system
var fs=require('fs')    

const { type } = require('os');
const { toUSVString } = require('util');
//write in file json

const saveStudentData = (data) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync(file, stringifyData)
}
//read data from json 
const getStudentsData = () => {
  const jsonData = fs.readFileSync(file)
  return JSON.parse(jsonData)   
}
//joy validation
const student_schema = Joi.object({
    id : Joi.number().integer().positive(),
    name: Joi.string().min(5).required(),
    note: Joi.number().integer().positive().required(),
    module:Joi.string().min(3).max(10).required()
  });
  const student_update_schema = Joi.object({
    id : Joi.number().integer().positive(),
    name: Joi.string().min(5),
    note: Joi.number().integer().positive(),
    module: Joi.string().min(3).max(10),
  });
  app.get('/api/students', (req, res)=> 
  {
    res.send(getStudentsData());
  });

//calcule moyenne
const calculeMoy=(modules,cb)=>{
    let sum=0;
    let i=0;
    modules.forEach(module => {
      i++;
      sum+=module.note
      
      
    });
    let moy=sum/i;
    cb(moy)
    
  }

//afficher nom et moyenne 
let afficher_nom_moy=(students,cb)=>{
  var name_moy={}
  var response=[]
  for (let x in students){
    student=students[x]
    name_moy.nom=student["nom"]
    name_moy.moyenne=student["moyenne"]
    response.push(name_moy)
    cb(response)
    
  }
}

//afficher chaque étudiant avec leur meilleure et leur moindre module. 

let afficher_meill_moin=(students,cb)=>{
  var arr=[]
  
  for (let x in students){
    var obj={}
    student=students[x]
    obj.nom=student.nom
   var meilleure=0;
   var moindre =20;
    student.modules.forEach((module)=>{
      if (module.note>meilleure){
        meilleure=module.note
        obj.meilleure_module=module
      }
      if(module.note<moindre){
        moindre=module.note
        obj.moindre_module=module
      }

    })
    arr.push(obj)
  }
  cb(arr)
  
}



 //restful api crud avec joi


app.post('/api/students',(req,res)=>{
  let validation_res = student_schema.validate(req.body);
  if(validation_res.error)
  return res.status(400).send(validation_res.error.message); 

        var students = getStudentsData()
  const newAccountId = Math.floor(100000 + Math.random() * 900000)
  var newStudent=req.body
  console.log(newStudent)
  console.log(newStudent.modules)
  calculeMoy(newStudent.modules,((moy)=>{
    newStudent.moyenne=moy
     students= getStudentsData()
     students[newAccountId]=newStudent
    console.log(students[newAccountId])
    saveStudentData(students)
    res.send({success: true, msg: 'student saved successfully'})
  
   }))
  })

app.get('/api/students', (req, res) => {
   const accounts = getStudentsData()
  res.send(accounts)
  })
  /*************************************** */

  app.put('/:numInsc', (req, res) => {
    let validation_res = student_update_schema.validate(req.body);
    if(validation_res.error)
      return res.status(400).send(validation_res.error.message);
   const students = getStudentsData()
  const numInsc =req.params.numInsc;
  if(students[numInsc]==undefined){
    res.send({success: false, msg: 'student  numInsc not exist'})

  }else{
    students[numInsc]=req.body
    saveStudentData(students)
    res.send({success: true, msg: 'student updated successfully'})
    
  }
 
  })
  /********************************************* */
  app.delete('/:numInsc', (req, res) => {
    const students = getStudentsData()
   const numInsc =req.params.numInsc;
     console.log("delete")
   if(students[numInsc]==undefined){
     res.send({success: false, msg: 'student  numInsc not exist'})
 
   }else{
     delete students[numInsc]
     saveStudentData(students)
     res.send({success: true, msg: 'student deleted successfully'});
     
   }
  })
//**************************** */

  app.get('/moyenne', (req, res) => {
    const students = getStudentsData()
    afficher_nom_moy(students,(response)=>{
    
      res.send(response);
   })
})
/***************************** */
app.get('/afficher_Meilleure_moindre', (req, res) => {const students = getStudentsData()
 afficher_meill_moin(students,(arr)=>{
  res.send(arr)
 })
})