import {app} from "./app"
import {ShipmentManager} from "./managers/ShipmentManager"
import {OrganizationManager} from "./managers/OrganizationManager"
import {Organization} from "./models/Organization"
import {Node, Shipment, TotalWeight, TransportPack} from "./models/Shipment"

const request = require('supertest');

describe('Organizations tests', () => {

    const organizationManager: OrganizationManager = new OrganizationManager()

    beforeEach(async () => {
        await organizationManager.cleanTable()
    })

    test('Organization does not exist and error is propagated',  async () => {
        await checkEmptyResponse("/organizations/12345")
    })

    test('Organization exists and is returned',  async () => {
        const organization: Organization = new Organization()
        organization.id = "12345"
        organization.code = "ABC123"
        await organization.save()
        await checkObjectResponse("/organizations/12345", organization)
    })

    test('Organization is saved successfully',  async () => {
        const organizationId = "12345"
        const code = "ABC123"
        const body = {
            id: organizationId,
            code: code
        }
        const res = await request(app).post("/organization").send(body)
        const record: Organization | null = await organizationManager.getOrganizationById(organizationId)
        expect(res.statusCode).toBe(200);
        expect(record?.id).toBe(organizationId)
        expect(record?.code).toBe(code)
    })
})

describe('Shipments tests', () => {
    const shipmentManager: ShipmentManager = new ShipmentManager()

    beforeEach(async () => {
        await shipmentManager.cleanTable()
    })

    test('Shipment does not exist and error is propagated', async () => {
        await checkEmptyResponse("/shipments/12345")
    })

    test('Shipment exists and is returned',  async () => {
        const totalWeight: TotalWeight = new TotalWeight()
        totalWeight.unit = "KILOGRAMS"
        totalWeight.weight = 2
        const node: Node = new Node
        node.totalWeight = totalWeight
        const shipment: Shipment = new Shipment()
        shipment.referenceId = "12345"
        shipment.organizations = ["ORG1", "ORG2"]
        shipment.estimatedTimeArrival = "2020-11-21T00:00:00"

        const transportPacks: TransportPack = new TransportPack()
        transportPacks.nodes = [node]
        shipment.transportPacks = transportPacks

        await shipment.save()
        await checkObjectResponse("/shipments/12345", shipment)
    })

    test('Shipment is saved successfully converting units to kilograms',  async () => {
        const referenceId = "12345"
        const organizations = ["ORG1", "ORG2"]
        const estimatedTimeArrival = "2020-11-21T00:00:00"

        const nodes = createDemoNodes()

        const body = {
            referenceId: referenceId,
            organizations: organizations,
            estimatedTimeArrival: estimatedTimeArrival,
            transportPacks: {
                nodes: nodes
            }
        }
        const res = await request(app).post("/shipment").send(body)
        const record: Shipment | null = await shipmentManager.getShipmentByReferenceId(referenceId)
        const node1: Node = record?.transportPacks.nodes[0]
        const node2: Node = record?.transportPacks.nodes[1]
        const node3: Node = record?.transportPacks.nodes[2]

        expect(res.statusCode).toBe(200);
        expect(record?.referenceId).toBe(referenceId)
        expect(record?.organizations).toStrictEqual(organizations)
        expect(record?.estimatedTimeArrival).toBe(estimatedTimeArrival)
        expect(node1.totalWeight.unit).toBe("KILOGRAMS")
        expect(node1.totalWeight.weight).toBe(2)
        expect(node2.totalWeight.unit).toBe("KILOGRAMS")
        expect(node2.totalWeight.weight).toBe(0.0283495)
        expect(node3.totalWeight.unit).toBe("KILOGRAMS")
        expect(node3.totalWeight.weight).toBe(0.453592)
    })

    test('TotalWeight is returned successfully for KILOGRAMS',  async () => {
        await checkTotalWeightForUnit("KILOGRAMS", 3.4819415)
    })

    test('TotalWeight is returned successfully for OUNCES',  async () => {
        await checkTotalWeightForUnit("OUNCES", 106.30394150000001)
    })

    test('TotalWeight is returned successfully for POUNDS',  async () => {
        await checkTotalWeightForUnit("POUNDS", 7.0958015)
    })
})

const checkEmptyResponse = async (endpoint: string) => {
    const res = await request(app).get(endpoint)
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe(JSON.stringify({message: "Object no found"}))
}

const checkObjectResponse = async (endpoint: string, object: any) => {
    const res = await request(app).get(endpoint)
    expect(res.statusCode).toBe(200);
    expect(res.text).toStrictEqual(JSON.stringify(object.serialize()))
}

const checkTotalWeightForUnit = async (unit: string, expectedValue: number) => {
    await createDemoShipments()
    const res = await request(app).get(`/shipments/totalWeight/${unit}`)
    expect(res.statusCode).toBe(200);
    const object = {
        totalWeight: expectedValue
    }
    expect(res.text).toStrictEqual(JSON.stringify(object))
}

const createDemoShipments = async () => {
    const referenceId1 = "12345"
    const organizations1 = ["ORG1", "ORG2"]
    const estimatedTimeArrival1 = "2020-11-21T00:00:00"
    const nodes1 = createDemoNodes()

    const shipment1Promise = createDemoShipment(referenceId1, organizations1, estimatedTimeArrival1, nodes1)

    const referenceId2 = "123456"
    const organizations2 = ["ORG3", "ORG4"]
    const estimatedTimeArrival2 = "2021-11-21T00:00:00"

    const totalWeight3: TotalWeight = new TotalWeight()
    totalWeight3.unit = "KILOGRAMS"
    totalWeight3.weight = 1
    const node3: Node = new Node
    node3.totalWeight = totalWeight3

    const nodes2 = [node3]

    const shipment2Promise = createDemoShipment(referenceId2, organizations2, estimatedTimeArrival2, nodes2)

    await Promise.all([shipment1Promise, shipment2Promise])
}

const createDemoShipment = async (referenceId: string, organizations: string[], estimatedTimeArrival: string, nodes: Node[]) => {
    const transportPacks: TransportPack = new TransportPack()
    transportPacks.nodes = nodes

    const shipment: Shipment = new Shipment()
    shipment.referenceId = referenceId
    shipment.organizations = organizations
    shipment.estimatedTimeArrival = estimatedTimeArrival
    shipment.transportPacks = transportPacks

    await shipment.save()
}

const createDemoNodes = () => {
    const totalWeight1: TotalWeight = new TotalWeight()
    totalWeight1.unit = "KILOGRAMS"
    totalWeight1.weight = 2
    const node1: Node = new Node
    node1.totalWeight = totalWeight1

    const totalWeight2: TotalWeight = new TotalWeight()
    totalWeight2.unit = "OUNCES"
    totalWeight2.weight = 1
    const node2: Node = new Node
    node2.totalWeight = totalWeight2

    const totalWeight3: TotalWeight = new TotalWeight()
    totalWeight3.unit = "POUNDS"
    totalWeight3.weight = 1
    const node3: Node = new Node
    node3.totalWeight = totalWeight3

    return [node1, node2, node3]
}