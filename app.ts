process.env = Object.assign(process.env, {
    DYNAMO_TYPES_ENDPOINT: "http://localhost:8000",
    AWS_ACCESS_KEY_ID: "mock",
    AWS_SECRET_ACCESS_KEY: "mock",
    AWS_REGION: "us-east-1"
});

import {Organization} from "./models/Organization"
import {Shipment} from "./models/Shipment"
import {Table} from "dynamo-types"
import {OrganizationManager} from "./managers/OrganizationManager"
import {ShipmentManager} from "./managers/ShipmentManager"

const express = require('express')
const bodyParser = require("body-parser");

export const app = express()
app.use(bodyParser.json());

app.post('/shipment', async (req: any, res: any) => {
    const shipment: Shipment = Object.assign(new Shipment(), req.body)
    shipment.normalize()
    await persistObject(shipment, res)
    res.end()
})

app.post('/organization', async (req: any, res: any) => {
    const organization: Organization = Object.assign(new Organization(), req.body)
    await persistObject(organization, res)
    res.end()
})

app.get('/shipments/:shipmentId', async (req: any, res: any) => {
    const referenceId: string = req.params.shipmentId
    const shipmentManager: ShipmentManager = new ShipmentManager()
    const shipment: Shipment | null = await shipmentManager.getShipmentByReferenceId(referenceId)
    sendResponse(shipment, res)
})

app.get('/organizations/:organizationId', async (req: any, res: any) => {
    const organizationId: string = req.params.organizationId
    const organizationManager: OrganizationManager = new OrganizationManager()
    const organization: Organization | null = await organizationManager.getOrganizationById(organizationId)
    sendResponse(organization, res)
})

app.get('/shipments/totalWeight/:units', async (req: any, res: any) => {
    const shipmentManager = new ShipmentManager()
    const shipments = await shipmentManager.scanTable()
    const units = req.params.units
    const shipmentsTotals: number[] = shipments.records.map((shipment: Shipment) => shipment.getTotalWeight(units))
    const totalWeight = shipmentsTotals.reduce((total: number, shipmentTotal: number) => total + shipmentTotal, 0)
    const response = {
        totalWeight: totalWeight
    }

    res.status(200).send(response)
})

const persistObject = async (object: Table, res: any) => {
    try{
        await object.save()
        console.log("Object saved successfully!")
        res.status(200)
    }catch (ex: any){
        console.error("There was an error saving the object")
        res.status(500)
    }
}

const sendResponse = (object: Table | null, res: any) => {
    if (object === null){
        console.log("Object is null")
        const response = {
            message: "Object no found"
        }
        res.status(400).send(response)
        return
    }
    console.log("Object is not null")
    res.status(200).send(object.serialize())
}