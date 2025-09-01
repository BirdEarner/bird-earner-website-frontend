import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { loadImageURI } from "@/services/api";

export function ServiceCard({ service, onEdit, onDelete }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative h-48">
        {service.imageUrl ? (
          <img
            src={loadImageURI(service.imageUrl)}
            alt={service.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle className="mb-2">{service.name}</CardTitle>
            <div className="text-sm text-gray-500 mb-2">
              Category: {service.category}
            </div>
            <div className="text-sm">
              {service.description ? (
                service.description.length > 100 ? (
                  `${service.description.substring(0, 100)}...`
                ) : (
                  service.description
                )
              ) : (
                "No description"
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
