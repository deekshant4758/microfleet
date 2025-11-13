#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const figlet = require('figlet');

// Load inquirer - handle ES module with .default
let inquirer;
try {
  const inquirerModule = require('inquirer');
  inquirer = inquirerModule.default || inquirerModule.createPromptModule();
} catch (e) {
  console.error('Failed to load inquirer:', e.message);
  process.exit(1);
}

// Load chalk - handle ES module with .default
let chalk;
try {
  const chalkModule = require('chalk');
  chalk = chalkModule.default || chalkModule;
} catch (e) {
  // Fallback colors
  chalk = {
    blue: str => str,
    green: str => str,
    red: str => str,
    yellow: str => str
  };
}

const API_BASE = 'http://localhost:8080/api';

class MicrofleetCLI {
  constructor() {
    this.program = new Command();
    try {
      this.setupCLI();
    } catch (error) {
      console.error(chalk.red('Failed to initialize CLI:'), error.message);
      process.exit(1);
    }
  }

  setupCLI() {
    this.program
      .name('microfleet')
      .description('Microfleet Management System CLI')
      .version('1.0.0');

    // Show banner
    this.showBanner();

    // Main interactive command
    this.program
      .action(() => this.interactiveMode());

    // Individual commands for direct usage
    this.program
      .command('drivers')
      .description('Manage drivers')
      .action(() => this.driversMenu());

    this.program
      .command('vehicles')
      .description('Manage vehicles')
      .action(() => this.vehiclesMenu());

    this.program
      .command('trips')
      .description('Manage trips')
      .action(() => this.tripsMenu());

    this.program.parse();
  }

  showBanner() {
    console.log(
      chalk.blue(
        figlet.textSync('Microfleet', { horizontalLayout: 'full' })
      )
    );
    console.log(chalk.green('    Fleet Management System CLI\n'));
  }

  async interactiveMode() {
    while (true) {
      try {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to manage?',
            choices: [
              { name: '🚗 Drivers', value: 'drivers' },
              { name: '🚙 Vehicles', value: 'vehicles' },
              { name: '🛣️ Trips', value: 'trips' },
              { name: '📊 Dashboard', value: 'dashboard' },
              { name: '❌ Exit', value: 'exit' }
            ]
          }
        ]);

        if (action === 'exit') {
          console.log(chalk.yellow('Goodbye! 👋'));
          process.exit(0);
        }

        await this.handleMainAction(action);
      } catch (error) {
        if (error.isTtyError) {
          console.error(chalk.red('Prompt couldn\'t be rendered in the current environment'));
        } else {
          console.error(chalk.red('Error:'), error.message);
        }
        process.exit(1);
      }
    }
  }

  async handleMainAction(action) {
    switch (action) {
      case 'drivers':
        await this.driversMenu();
        break;
      case 'vehicles':
        await this.vehiclesMenu();
        break;
      case 'trips':
        await this.tripsMenu();
        break;
      case 'dashboard':
        await this.showDashboard();
        break;
    }
  }

  async driversMenu() {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Driver Management:',
          choices: [
            { name: '👥 List all drivers', value: 'list' },
            { name: '➕ Create new driver', value: 'create' },
            { name: '🔍 Get driver by ID', value: 'get' },
            { name: '✏️ Update driver', value: 'update' },
            { name: '🚗 Assign vehicle', value: 'assign' },
            { name: '🚫 Unassign vehicle', value: 'unassign' },
            { name: '🗑️ Delete driver', value: 'delete' },
            { name: '🔙 Back to main menu', value: 'back' }
          ]
        }
      ]);

      if (action === 'back') return;

      switch (action) {
        case 'list':
          await this.listDrivers();
          break;
        case 'create':
          await this.createDriver();
          break;
        case 'get':
          await this.getDriver();
          break;
        case 'update':
          await this.updateDriver();
          break;
        case 'assign':
          await this.assignVehicle();
          break;
        case 'unassign':
          await this.unassignVehicle();
          break;
        case 'delete':
          await this.deleteDriver();
          break;
      }
    } catch (error) {
      console.log(chalk.red('Error:'), error.message);
    }
  }

  async vehiclesMenu() {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Vehicle Management:',
          choices: [
            { name: '🚙 List all vehicles', value: 'list' },
            { name: '➕ Create new vehicle', value: 'create' },
            { name: '🔍 Get vehicle by ID', value: 'get' },
            { name: '✏️ Update vehicle', value: 'update' },
            { name: '🗑️ Delete vehicle', value: 'delete' },
            { name: '🔙 Back to main menu', value: 'back' }
          ]
        }
      ]);

      if (action === 'back') return;

      switch (action) {
        case 'list':
          await this.listVehicles();
          break;
        case 'create':
          await this.createVehicle();
          break;
        case 'get':
          await this.getVehicle();
          break;
        case 'update':
          await this.updateVehicle();
          break;
        case 'delete':
          await this.deleteVehicle();
          break;
      }
    } catch (error) {
      console.log(chalk.red('Error:'), error.message);
    }
  }

  async tripsMenu() {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Trip Management:',
          choices: [
            { name: '🛣️ List all trips', value: 'list' },
            { name: '➕ Create new trip', value: 'create' },
            { name: '🔍 Get trip by ID', value: 'get' },
            { name: '✏️ Update trip', value: 'update' },
            { name: '🗑️ Delete trip', value: 'delete' },
            { name: '🔙 Back to main menu', value: 'back' }
          ]
        }
      ]);

      if (action === 'back') return;

      switch (action) {
        case 'list':
          await this.listTrips();
          break;
        case 'create':
          await this.createTrip();
          break;
        case 'get':
          await this.getTrip();
          break;
        case 'update':
          await this.updateTrip();
          break;
        case 'delete':
          await this.deleteTrip();
          break;
      }
    } catch (error) {
      console.log(chalk.red('Error:'), error.message);
    }
  }

  // API Methods for Drivers
  async listDrivers() {
    const response = await axios.get(`${API_BASE}/drivers`);
    console.log(chalk.blue('\n=== Drivers ==='));
    response.data.forEach(driver => {
      console.log(chalk.green(`ID: ${driver.id}`), `| Name: ${driver.name} | License: ${driver.license} | Status: ${driver.status}`);
      if (driver.assignedVehicle) {
        console.log(chalk.yellow(`   🚗 Assigned Vehicle: ${driver.assignedVehicle.model} (${driver.assignedVehicle.regNumber})`));
      }
      console.log('---');
    });
  }

  async createDriver() {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Driver name:' },
      { type: 'input', name: 'license', message: 'License number:' },
      { type: 'input', name: 'phone', message: 'Phone number:' }
    ]);

    const response = await axios.post(`${API_BASE}/drivers`, answers);
    console.log(chalk.green('✅ Driver created successfully!'));
    console.log('Driver ID:', response.data.id);
  }

  async getDriver() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Enter driver ID:' }
    ]);

    const response = await axios.get(`${API_BASE}/drivers/${id}`);
    const driver = response.data;
    console.log(chalk.blue('\n=== Driver Details ==='));
    console.log(`ID: ${driver.id}`);
    console.log(`Name: ${driver.name}`);
    console.log(`License: ${driver.license}`);
    console.log(`Phone: ${driver.phone}`);
    console.log(`Status: ${driver.status}`);
    if (driver.assignedVehicle) {
      console.log(chalk.yellow(`Assigned Vehicle: ${driver.assignedVehicle.model} (${driver.assignedVehicle.regNumber})`));
    }
    console.log(`Trips: ${driver.trips ? driver.trips.length : 0}`);
  }

  // Similar methods for vehicles and trips...
  async listVehicles() {
    const response = await axios.get(`${API_BASE}/vehicles`);
    console.log(chalk.blue('\n=== Vehicles ==='));
    response.data.forEach(vehicle => {
      console.log(chalk.green(`ID: ${vehicle.id}`), `| Model: ${vehicle.model} | Reg: ${vehicle.regNumber} | Capacity: ${vehicle.capacity}`);
      if (vehicle.driver) {
        console.log(chalk.yellow(`   👤 Assigned Driver: ${vehicle.driver.name}`));
      }
      console.log('---');
    });
  }

  async createVehicle() {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'model', message: 'Vehicle model:' },
      { type: 'input', name: 'regNumber', message: 'Registration number:' },
      { type: 'input', name: 'capacity', message: 'Capacity:' }
    ]);

    const response = await axios.post(`${API_BASE}/vehicles`, answers);
    console.log(chalk.green('✅ Vehicle created successfully!'));
    console.log('Vehicle ID:', response.data.id);
  }

  async listTrips() {
    const response = await axios.get(`${API_BASE}/trips`);
    console.log(chalk.blue('\n=== Trips ==='));
    response.data.forEach(trip => {
      console.log(chalk.green(`ID: ${trip.id}`), `| ${trip.origin} → ${trip.destination} | Distance: ${trip.distanceKm}km`);
      console.log(`   Driver: ${trip.driver.name} | Vehicle: ${trip.vehicle.model} | Status: ${trip.status}`);
      console.log('---');
    });
  }

  async createTrip() {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'origin', message: 'Trip origin:' },
      { type: 'input', name: 'destination', message: 'Trip destination:' },
      { type: 'input', name: 'driverId', message: 'Driver ID:' },
      { type: 'input', name: 'vehicleId', message: 'Vehicle ID:' },
      { type: 'input', name: 'distanceKm', message: 'Distance (km):' }
    ]);

    const response = await axios.post(`${API_BASE}/trips`, answers);
    console.log(chalk.green('✅ Trip created successfully!'));
    console.log('Trip ID:', response.data.id);
  }

  async showDashboard() {
    try {
      const [driversRes, vehiclesRes, tripsRes] = await Promise.all([
        axios.get(`${API_BASE}/drivers`),
        axios.get(`${API_BASE}/vehicles`),
        axios.get(`${API_BASE}/trips`)
      ]);

      console.log(chalk.blue('\n📊 Microfleet Dashboard'));
      console.log(chalk.green('======================='));
      console.log(`👥 Drivers: ${driversRes.data.length}`);
      console.log(`🚙 Vehicles: ${vehiclesRes.data.length}`);
      console.log(`🛣️ Active Trips: ${tripsRes.data.filter(t => t.status === 'ACTIVE').length}`);
      
      const assignedVehicles = vehiclesRes.data.filter(v => v.driverId).length;
      console.log(`🔗 Assigned Vehicles: ${assignedVehicles}/${vehiclesRes.data.length}`);
    } catch (error) {
      console.log(chalk.red('Error fetching dashboard data:'), error.message);
    }
  }

  // Add other methods (update, delete, assign, unassign) following similar patterns...
  async assignVehicle() {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'driverId', message: 'Driver ID:' },
      { type: 'input', name: 'vehicleId', message: 'Vehicle ID:' }
    ]);

    const response = await axios.post(`${API_BASE}/drivers/${answers.driverId}/assign-vehicle`, {
      vehicleId: answers.vehicleId
    });
    console.log(chalk.green('✅ Vehicle assigned successfully!'));
  }

  async updateDriver() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Driver ID to update:' }
    ]);

    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'New name (leave empty to keep current):', default: '' },
      { type: 'input', name: 'license', message: 'New license (leave empty to keep current):', default: '' },
      { type: 'input', name: 'phone', message: 'New phone (leave empty to keep current):', default: '' },
      { type: 'input', name: 'status', message: 'New status (leave empty to keep current):', default: '' }
    ]);

    // Remove empty fields
    const updateData = Object.fromEntries(
      Object.entries(answers).filter(([_, value]) => value !== '')
    );

    const response = await axios.put(`${API_BASE}/drivers/${id}`, updateData);
    console.log(chalk.green('✅ Driver updated successfully!'));
  }

  async unassignVehicle() {
    const { driverId } = await inquirer.prompt([
      { type: 'input', name: 'driverId', message: 'Driver ID:' }
    ]);

    await axios.post(`${API_BASE}/drivers/${driverId}/unassign-vehicle`);
    console.log(chalk.green('✅ Vehicle unassigned successfully!'));
  }

  async deleteDriver() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Driver ID to delete:' }
    ]);

    const { confirm } = await inquirer.prompt([
      { type: 'confirm', name: 'confirm', message: 'Are you sure?' }
    ]);

    if (confirm) {
      await axios.delete(`${API_BASE}/drivers/${id}`);
      console.log(chalk.green('✅ Driver deleted successfully!'));
    }
  }

  async getVehicle() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Enter vehicle ID:' }
    ]);

    const response = await axios.get(`${API_BASE}/vehicles/${id}`);
    const vehicle = response.data;
    console.log(chalk.blue('\n=== Vehicle Details ==='));
    console.log(`ID: ${vehicle.id}`);
    console.log(`Model: ${vehicle.model}`);
    console.log(`Registration: ${vehicle.regNumber}`);
    console.log(`Capacity: ${vehicle.capacity}`);
    console.log(`Status: ${vehicle.status}`);
    if (vehicle.driver) {
      console.log(chalk.yellow(`Assigned Driver: ${vehicle.driver.name}`));
    }
    console.log(`Trips: ${vehicle.trips ? vehicle.trips.length : 0}`);
  }

  async updateVehicle() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Vehicle ID to update:' }
    ]);

    const answers = await inquirer.prompt([
      { type: 'input', name: 'model', message: 'New model (leave empty to keep current):', default: '' },
      { type: 'input', name: 'regNumber', message: 'New registration (leave empty to keep current):', default: '' },
      { type: 'input', name: 'capacity', message: 'New capacity (leave empty to keep current):', default: '' },
      { type: 'input', name: 'status', message: 'New status (leave empty to keep current):', default: '' }
    ]);

    const updateData = Object.fromEntries(
      Object.entries(answers).filter(([_, value]) => value !== '')
    );

    await axios.put(`${API_BASE}/vehicles/${id}`, updateData);
    console.log(chalk.green('✅ Vehicle updated successfully!'));
  }

  async deleteVehicle() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Vehicle ID to delete:' }
    ]);

    const { confirm } = await inquirer.prompt([
      { type: 'confirm', name: 'confirm', message: 'Are you sure?' }
    ]);

    if (confirm) {
      await axios.delete(`${API_BASE}/vehicles/${id}`);
      console.log(chalk.green('✅ Vehicle deleted successfully!'));
    }
  }

  async getTrip() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Enter trip ID:' }
    ]);

    const response = await axios.get(`${API_BASE}/trips/${id}`);
    const trip = response.data;
    console.log(chalk.blue('\n=== Trip Details ==='));
    console.log(`ID: ${trip.id}`);
    console.log(`Origin: ${trip.origin}`);
    console.log(`Destination: ${trip.destination}`);
    console.log(`Distance: ${trip.distanceKm}km`);
    console.log(`Driver: ${trip.driver.name}`);
    console.log(`Vehicle: ${trip.vehicle.model}`);
    console.log(`Status: ${trip.status}`);
    console.log(`Started: ${new Date(trip.startTime).toLocaleString()}`);
    if (trip.endTime) {
      console.log(`Ended: ${new Date(trip.endTime).toLocaleString()}`);
    }
  }

  async updateTrip() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Trip ID to update:' }
    ]);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What action?',
        choices: [
          { name: '✅ End trip', value: 'end' },
          { name: '❌ Cancel trip', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'end') {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'distanceKm', message: 'Final distance (km):', default: '' },
        { type: 'confirm', name: 'useCurrentTime', message: 'Use current time as end time?', default: true }
      ]);

      const data = {};
      if (answers.distanceKm) data.distanceKm = parseFloat(answers.distanceKm);
      if (!answers.useCurrentTime) {
        const { endTime } = await inquirer.prompt([
          { type: 'input', name: 'endTime', message: 'End time (ISO format):' }
        ]);
        data.endTime = endTime;
      }

      await axios.put(`${API_BASE}/trips/${id}/end`, data);
      console.log(chalk.green('✅ Trip ended successfully!'));
    } else if (action === 'cancel') {
      await axios.put(`${API_BASE}/trips/${id}/cancel`, {});
      console.log(chalk.green('✅ Trip cancelled successfully!'));
    }
  }

  async deleteTrip() {
    const { id } = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Trip ID to delete:' }
    ]);

    const { confirm } = await inquirer.prompt([
      { type: 'confirm', name: 'confirm', message: 'Are you sure?' }
    ]);

    if (confirm) {
      await axios.delete(`${API_BASE}/trips/${id}`);
      console.log(chalk.green('✅ Trip deleted successfully!'));
    }
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log(chalk.red('Unexpected error:'), error.message);
  process.exit(1);
});

// Start the CLI
new MicrofleetCLI();