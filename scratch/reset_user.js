const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const value = parts.slice(1).join('=').trim()
    env[key] = value
  }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetUser() {
  const targetEmail = 'admin@eip.com'
  const newPassword = 'admin123password' // We will reset/create with a secure but known password

  console.log('Retrieving users from Supabase Auth...')
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  const existingUser = users.find(u => u.email === targetEmail)

  if (existingUser) {
    console.log(`User ${targetEmail} exists. Resetting password and user_metadata...`)
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Administrador',
          role: 'admin'
        }
      }
    )

    if (error) {
      console.error('Error resetting password:', error.message)
    } else {
      console.log(`Password and metadata updated successfully for ${targetEmail}!`)
      console.log(`Use Username: admin`)
      console.log(`Use Password: ${newPassword}`)
    }
  } else {
    console.log(`User ${targetEmail} does not exist. Creating user...`)
    const { data, error } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: newPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Administrador',
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating user:', error.message)
    } else {
      console.log(`User ${targetEmail} created successfully!`)
      console.log(`Use Username: admin`)
      console.log(`Use Password: ${newPassword}`)
    }
  }
}

resetUser()
