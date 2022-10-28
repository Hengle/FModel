﻿#version 330 core

in vec3 fPos;
in vec3 fNormal;
in vec2 fTexCoords;
in float fTexIndex;
in vec4 fColor;

struct Material {
    sampler2D diffuseMap[8];
    sampler2D normalMap[8];
    sampler2D specularMap[8];
    sampler2D emissionMap;

    bool useSpecularMap;

    bool hasDiffuseColor;
    vec4 diffuseColor;

    vec4 emissionColor;

    float metallic_value;
    float roughness_value;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Material material;
uniform Light light;
uniform vec3 viewPos;
uniform bool display_vertex_colors;

out vec4 FragColor;

vec4 getValueFromSamplerArray(sampler2D array[8]) {
    if (fTexIndex < 1.0) {
        return texture(array[0], fTexCoords);
    } if (fTexIndex < 2.0) {
        return texture(array[1], fTexCoords);
    } if (fTexIndex < 3.0) {
        return texture(array[2], fTexCoords);
    } else {
        return texture(array[3], fTexCoords);
    }
}

vec3 getNormalFromMap()
{
    vec3 tangentNormal = getValueFromSamplerArray(material.normalMap).xyz * 2.0 - 1.0;

    vec3 q1  = dFdx(fPos);
    vec3 q2  = dFdy(fPos);
    vec2 st1 = dFdx(fTexCoords);
    vec2 st2 = dFdy(fTexCoords);

    vec3 n   = normalize(fNormal);
    vec3 t  = normalize(q1*st2.t - q2*st1.t);
    vec3 b  = -normalize(cross(n, t));
    mat3 tbn = mat3(t, b, n);

    return normalize(tbn * tangentNormal);
}

void main()
{
    if (display_vertex_colors)
    {
        FragColor = fColor;
    }
    else
    {
        vec3 n_normal_map = getNormalFromMap();
        vec3 n_light_direction = normalize(light.position - fPos);
        float diff = max(dot(n_normal_map, n_light_direction), 0.0f);

        if (material.hasDiffuseColor)
        {
            vec4 result = vec4(light.ambient, 1.0) * material.diffuseColor;
            result += vec4(light.diffuse, 1.0) * diff * material.diffuseColor;
            FragColor = result;
        }
        else
        {
            vec3 result = light.ambient * vec3(getValueFromSamplerArray(material.diffuseMap));

            // diffuse
            vec4 diffuse_map = getValueFromSamplerArray(material.diffuseMap);
            result += light.diffuse * diff * diffuse_map.rgb;

            // specular
            if (material.useSpecularMap)
            {
                vec3 n_view_direction = normalize(viewPos - fPos);
                vec3 reflect_direction = reflect(-n_light_direction, n_normal_map);
                float metallic = pow(max(dot(n_view_direction, reflect_direction), 0.0f), material.metallic_value);
                vec3 specular_map = vec3(getValueFromSamplerArray(material.specularMap));
                result += specular_map.r * light.specular * (metallic * specular_map.g);
                result += material.roughness_value * specular_map.b;
            }

            // emission
            vec3 emission_map = vec3(texture(material.emissionMap, fTexCoords));
            result += material.emissionColor.rgb * emission_map;

            FragColor = vec4(result, 1.0);
        }
    }
}
