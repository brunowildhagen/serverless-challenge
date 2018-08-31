'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const s3 = new AWS.S3();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.extractMetadata = (event, context, callback) => {
	console.log("extractMetadata()");
	var imagem = {};
	var imagens = [];
	
	event.Records.forEach(element => {
		var imagem = {};
		imagem.bucket = element.s3.bucket.name;
		imagem.key  = element.s3.object.key;
		imagem.size = element.s3.object.size; 
		imagem.s3objectkey = element.s3.object.eTag;

		
		dynamoDb.put(
			{
				TableName: process.env.DYNAMODB_TABLE,
				Item:imagem
			},
			function(err, data) {
			if (err) {
			  console.log("Error", err);
			} else {
			  console.log("Success", data);
			}
		  });
	});

};

module.exports.getMetadata = (event, context, callback) => {
	console.log("/images/{s3objectkey}");
	
	dynamoDb.get({
			TableName: process.env.DYNAMODB_TABLE,
			Key:{
				"s3objectkey": event.pathParameters.s3objectkey
			}
		}
		,
		function(err, data) {
			console.log(data);
			console.log(process.env.DYNAMODB_TABLE);
			if (err) {
			callback(err);
			} else {
				callback(null, {
					"statusCode": 200,
					"headers": {
						"Content-Type": "application/json"
					},
					"body": JSON.stringify({message:"successo!" , data:data.Item || {}})
				});
			}
	  });
};

module.exports.GetImage = (event, context, callback) => {
	console.log("GetImage/{s3objectkey}");
	


	dynamoDb.get({
			TableName: process.env.DYNAMODB_TABLE,
			Key:{
				"s3objectkey": event.pathParameters.s3objectkey
			}
		}
		,
		function(err, data) {
			console.log(data);
			console.log(process.env.DYNAMODB_TABLE);
			if (err) {
			callback(err);
			} else {

				s3.getObject({Bucket: data.bucket, Key:data.key},
					function (err, arquivo){
						if (err) {
							callback(err);
						} else if(arquivo){
							callback(null, {
								"statusCode": 200,
								"headers": {
									"Content-Type": "image/png"
								},
								"body": arquivo.Body.toString('base64')
							});
						}
					}
				);
			}
	  });



}