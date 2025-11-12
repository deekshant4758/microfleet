const prisma = require('../prismaClient');

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: { driver: true, vehicle: true }
    });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTrip = async (req, res) => {
  const { origin, destination, driverId, vehicleId, distanceKm } = req.body;
  try {
    const trip = await prisma.trip.create({
      data: {
        origin,
        destination,
        distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
        driverId: parseInt(driverId, 10),
        vehicleId: parseInt(vehicleId, 10)
      },
      include: { driver: true, vehicle: true }
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTripById = async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(id, 10) },
      include: { driver: true, vehicle: true }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const { status, endTime } = req.body;
  try {
    const data = { status };
    if (endTime) {
      data.endTime = new Date(endTime).toISOString();
    }

    const trip = await prisma.trip.update({
      where: { id: parseInt(id, 10) },
      data,
      include: { driver: true, vehicle: true }
    });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.trip.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};