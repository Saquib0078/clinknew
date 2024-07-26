const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
    taskName:{type:String,required:true},
    taskDescription:{type:String,required:true},
    time:{type:String,required:true},
    comments: {type: Number, default: 0},
    date: {type: String, required: true},
    imageID: {type: String},
    taskUrl: {type: String},
    radioButtonValue: { type: String},
    limitedUsers: [{ type: String }],
    createdBy:{type: mongoose.Schema.Types.ObjectId,
        ref: 'users'},
        
    status:{type:String,
        default: 'pending'},
        completedUsers: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'users',
            },
          ],

},{
    timestamps: true
});


const taskCommentSchema = new mongoose.Schema({
    taskID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    comment: {type: String, required: true, maxLength: 300},
    replies: {type: Number},
    time: {type: String, required: true}
});

const taskCommentReplySchema = new mongoose.Schema({
   taskID: {type: String, required: true},
    commentID: {type: String, required: true},
    num: {type: String, required: true, maxLength: 10},
    reply: {type: String, required: true, maxLength: 300},
    time: {type: String, required: true}
});

const employeeSchema = new mongoose.Schema({
  basicInfo: {
    givenName: String,
    familyName: String,
    addressLine: String,
    city: String,
    postalCode: String,
    email: String,
    countryCode: String,
    phoneNumber: String,
  },
  experience: {
    jobTitle: String,
    company: String,
    location: String,
    currentlyWorkHere: Boolean,
    workFrom: String,
    workTo: String,
    roleDescription: String,
  },
  education: {
    school: String,
    degree: String,
    fieldOfStudy: String,
    educationFrom: String,
    educationTo: String,
    languages: String,
    skills: String,
    websites: String,
    socialNetworks: String,
  },
  documents: {
    aadharCard: String,
    panCard: String,
    passportPhoto: String,
    birthCertificate: String,
  },
  employment: {
    employmentJobTitle: String,
    department: String,
    startDate: String,
    employmentType: String,
    supervisorName: String,
  },
  legal: {
    signedContract: Boolean,
    signedNDA: Boolean,
    handbookAcknowledgment: Boolean,
    taxForms: Boolean,
  },
  payroll: {
    bankName: String,
    bankAccountNumber: String,
    ifscCode: String,
    branchAddress: String,
  },
  itAccess: {
    preferredUsername: String,
    deviceRequirements: String,
    softwareRequirements: String,
  },
  companyLogin: {
    companyEmail: String,
    password: String,
  },
});

const Employee = mongoose.model('Employee', employeeSchema);


const TaskCommentModel = new mongoose.model("task-comments", taskCommentSchema);
const TaskReplyModel = new mongoose.model("task-comment-replies", taskCommentReplySchema);
const TaskModel = new mongoose.model("task", taskSchema);
module.exports = {
    TaskCommentModel,TaskReplyModel,TaskModel,Employee
}