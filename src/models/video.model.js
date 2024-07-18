import mongooes ,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const vidoesSchema= new Schema(
    {
       videoFile:{
        type:String, //cloudinary url
        required:true
       },
       thumbnail:{
        type:String,
        required:true
       },
       title:{
        type:String,
        required:true
       },
       description:{
        type:String,
        required:true
       },
       duration:{
        type:Number, 
        required:true
       },
       views:{
        type:Number,
        default:0
       },
       isPubliced:{
        type:Boolean,
        default:true
       },
       owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
       }
    },
    {
        timestamps:true
    }
)

vidoesSchema.plugin(mongooseAggregatePaginate)

export const Video= mongooes.model("Video",vidoesSchema)