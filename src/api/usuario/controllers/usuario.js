'use strict';

/**
 * usuario controller
 */
const bcrypt = require('bcryptjs');
const { sanitizeEntity } = require('@strapi/utils');


const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::usuario.usuario',
    ({ strapi }) =>({
        async login(ctx) {
            const { username, password } = ctx.request.body;
        
            // Verifica si se proporcionaron los datos
            if (!username || !password) {
              return ctx.badRequest('Faltan parámetros (username o password)');
            }
        
             try {
              // Busca el usuario por username o email (aquí puedes personalizar)
              const user = await strapi.query('api::usuario.usuario').findOne({
                where: {
                    $or: [
                        { usuario: username },
                        { Nombre: username },
                        { Correo: username }, // Si usas el mismo valor para username y email en la solicitud
                      ]
                },
              });
        
            //   // Si el usuario no existe
              if (!user) {
                return ctx.unauthorized('Credenciales incorrectas');
              }
        
            //   // Compara la contraseña con la almacenada en la base de datos
              const isPasswordValid = await bcrypt.compare(password, user.contrasena);
        
              if (!isPasswordValid) {
                return ctx.unauthorized('Contraseña incorrecta');
              }
        
              // Opcional: Elimina la contraseña de la respuesta
            //   const sanitizedUser = sanitizeEntity(user, {
            //     model: strapi.models['plugin::users-permissions.user'],
            //   });
            //   delete sanitizedUser.contrasena;
              delete user.contrasena;
              // Devuelve el usuario sin la contraseña si la autenticación es exitosa
              return ctx.send({
                message: 'Inicio de sesión exitoso',
                data: user,
              });
        
            } catch (error) {
              console.log(error);
              return ctx.internalServerError({message:'Hubo un error al procesar la solicitud',data:null});
            }
          }
    })
);
