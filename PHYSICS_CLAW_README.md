# Physics-Based Claw System with Grab Functionality

## Overview

The claw system has been upgraded from simple lerp interpolation to physics-based rotation using controlled torque forces. This makes the claw movement realistic and allows it to actually grab and hold physics objects in the scene.

## Key Changes

### 1. **Controlled Physics-Based Rotation**
- **Before**: Used `OMath.lerp()` for smooth rotation interpolation
- **After**: Uses RAPIER physics engine with **controlled torque forces** applied to rigid bodies
- **Fixed**: Wild spinning issue resolved with velocity limiting and constraints

### 2. **Realistic Physics Interaction & Grabbing**
- Each claw part is now a physics rigid body with small sphere colliders
- The claw can now **actually grab and hold objects** using physics constraints
- Movement feels natural with momentum and inertia, but controlled

### 3. **Configurable Physics Parameters**
- `torque_force`: Strength of the rotation force (default: 5.0 - reduced from 50.0)
- `rotation_damping`: Angular damping to prevent infinite spinning (default: 0.95 - increased)
- `max_angular_velocity`: Maximum rotation speed (default: 3.0 - reduced from 10.0)
- `physics_enabled`: Toggle between physics and lerp modes

### 4. **New Grab System Parameters**
- `grab_distance`: Distance to detect grab targets (default: 1.0)
- `grab_force`: Force to hold grabbed objects (default: 10.0)
- `max_grabbed_objects`: Maximum objects the claw can hold (default: 3)

## How It Works

### **Controlled Physics Initialization**
1. Each claw part gets converted to a dynamic rigid body
2. **Constraints are added** to limit rotation and prevent wild spinning
3. **Velocity limiting** prevents excessive angular velocity
4. High linear damping keeps the claw in place while allowing controlled rotation

### **Smart Torque Application**
1. Calculates the shortest rotation direction to target
2. **Applies controlled torque** with velocity checking
3. **Automatically slows down** if moving too fast
4. Physics engine handles movement with momentum, but safely

### **Grab System**
1. **Detects nearby physics objects** within grab distance
2. **Creates physics constraints** to hold grabbed objects
3. **Automatically grabs** when claws open, **releases** when claws close
4. **Manual grab/release** buttons available in TweakPane

### **Visual Sync**
- Visual rotation is synced with physics body rotation
- Smooth, realistic movement that can interact with objects
- No more wild spinning or erratic behavior

## Usage

### **Toggle Physics Mode**
- Use the TweakPane to enable/disable physics mode
- Adjust torque force and damping in real-time
- Switch back to lerp mode if needed

### **Grab System Controls**
- **Automatic**: Claws automatically grab objects when opened, release when closed
- **Manual**: Use "Grab Objects" and "Release Objects" buttons in TweakPane
- **Adjustable**: Modify grab distance, force, and max objects in real-time

### **Interactive Objects**
- The scene includes interactive spheres that the claw can grab
- These spheres have physics bodies and can be moved by the claw
- Perfect for testing grab mechanics and physics interaction

## Benefits

1. **Controlled Movement**: Natural acceleration/deceleration without wild spinning
2. **Real Object Interaction**: Can actually grab, hold, and move physics objects
3. **Configurable Feel**: Easy to tune the claw behavior and grab system
4. **Fallback Support**: Automatically falls back to lerp if physics fails
5. **Performance Optimized**: Efficient collision detection and constraint system

## Technical Details

### **RAPIER Integration**
- Uses `@dimforge/rapier3d-compat` for physics simulation
- Each claw part is a separate rigid body with constraints
- Small sphere colliders provide precise grab detection
- Physics constraints create realistic object holding

### **Anti-Spinning Measures**
- **Velocity limiting**: Maximum angular velocity enforced
- **High damping**: Angular damping prevents infinite spinning
- **Constraint system**: Rotation limits prevent excessive movement
- **Smart torque**: Only applies force when needed and safe

### **Grab System Architecture**
- **Distance-based detection**: Finds objects within grab range
- **Constraint-based holding**: Uses RAPIER impulse joints
- **Automatic management**: Grabs on open, releases on close
- **Manual override**: Buttons for direct control

## Troubleshooting

### **Claw Still Spinning**
- Reduce `torque_force` in TweakPane (try 1.0-5.0)
- Increase `rotation_damping` (try 0.95-0.99)
- Lower `max_angular_velocity` (try 1.0-3.0)

### **Grab System Not Working**
- Check that `physics_enabled` is true in Settings
- Ensure RAPIER is properly initialized
- Verify `grab_distance` is appropriate for your scene
- Check browser console for physics errors

### **Performance Issues**
- Reduce number of interactive objects
- Lower physics timestep if needed
- Consider using lerp mode for simple animations

## Future Enhancements

1. **Advanced Grab Detection**: Visual feedback when objects are in grab range
2. **Constraint Types**: Different joint types for different grab behaviors
3. **Haptic Feedback**: Force feedback for grab interactions
4. **Multi-Object Physics**: Better handling of multiple grabbed objects
5. **Grab Animation**: Smooth transition when grabbing/releasing objects

## Quick Start Guide

1. **Enable Physics**: Set `physics_enabled` to true in TweakPane
2. **Adjust Torque**: Start with `torque_force` at 2.0-5.0
3. **Set Damping**: Use `rotation_damping` at 0.95-0.99
4. **Test Movement**: Open/close claws to see controlled rotation
5. **Try Grabbing**: Open claws near physics objects to grab them
6. **Fine-tune**: Adjust parameters until movement feels right
