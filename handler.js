// exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: "Go Serverless v4! Your function executed successfully!",
//     }),
//   };
// };

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.createItem = async (event) => {
  try {
    const data = JSON.parse(event.body);
    
    if (!data.name || !data.description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const newItem = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB
      .put({
        TableName: "ItemsTable",
        Item: newItem,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Item created", item: newItem }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};


module.exports.getItem = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing item ID" }),
      };
    }

    const result = await dynamoDB
      .get({
        TableName: "ItemsTable",
        Key: { id },
      })
      .promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};
