export interface ProductData {
    id :string
    name:string
    description:string | null
    price:number
    stock:number
    client_id:string
    createAt:Date
    updatedAt:Date
}

/*
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  stock       Int
  client_id   String   // Clave para multitenencia
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
*/