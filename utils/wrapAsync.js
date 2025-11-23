module.exports = (fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
};

//  try catch perform krne ka tarika hai