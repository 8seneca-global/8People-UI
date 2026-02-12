"use client";

import { useState } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { Badge } from "@/modules/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/modules/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { Label } from "@/modules/core/components/ui/label";
import { useStore } from "@/lib/store";
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { Position } from "@/lib/mock-data";

export default function PositionsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const {
    positions,
    organizationalUnits,
    jobClassifications,
    employees,
    addPosition,
    updatePosition,
    deletePosition,
  } = useStore();

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    jobClassificationId: "",
    organizationalUnitId: "",
    parentPositionId: "",
    costCenter: "",
    fte: 1.0,
    hiringStatus: "vacant" as Position["hiringStatus"],
    focusArea: "",
    workMode: "hybrid" as Position["workMode"],
    officeLocation: "",
  });

  const filteredPositions = positions.filter((pos) => {
    const matchesSearch =
      pos.title.toLowerCase().includes(search.toLowerCase()) ||
      pos.code.toLowerCase().includes(search.toLowerCase()) ||
      pos.incumbentName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || pos.hiringStatus === filterStatus;
    const matchesUnit =
      filterUnit === "all" || pos.organizationalUnitId === filterUnit;
    return (
      matchesSearch && matchesStatus && matchesUnit && pos.status === "active"
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      code: "",
      title: "",
      jobClassificationId: "",
      organizationalUnitId: "",
      parentPositionId: "",
      costCenter: "",
      fte: 1.0,
      hiringStatus: "vacant",
      focusArea: "",
      workMode: "hybrid",
      officeLocation: "",
    });
    setEditingPosition(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (pos: Position) => {
    setFormData({
      code: pos.code,
      title: pos.title,
      jobClassificationId: pos.jobClassificationId,
      organizationalUnitId: pos.organizationalUnitId,
      parentPositionId: pos.parentPositionId || "",
      costCenter: pos.costCenter || "",
      fte: pos.fte,
      hiringStatus: pos.hiringStatus,
      focusArea: pos.focusArea || "",
      workMode: pos.workMode || "hybrid",
      officeLocation: pos.officeLocation || "",
    });
    setEditingPosition(pos);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    const jobClass = jobClassifications.find(
      (j) => j.id === formData.jobClassificationId,
    );
    const orgUnit = organizationalUnits.find(
      (u) => u.id === formData.organizationalUnitId,
    );
    const parentPos = positions.find((p) => p.id === formData.parentPositionId);

    const positionData = {
      ...formData,
      jobClassificationTitle: jobClass?.title || "",
      organizationalUnitName: orgUnit?.name || "",
      parentPositionTitle: parentPos?.title,
      status: "active" as const,
      validFrom: new Date().toISOString().split("T")[0],
    };

    if (editingPosition) {
      updatePosition(editingPosition.id, positionData);
    } else {
      addPosition(positionData);
    }
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this position?")) {
      deletePosition(id);
    }
  };

  const getStatusBadge = (status: Position["hiringStatus"]) => {
    switch (status) {
      case "filled":
        return (
          <Badge className="bg-success/20 text-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Filled
          </Badge>
        );
      case "vacant":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Vacant
          </Badge>
        );
      case "hiring":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Hiring
          </Badge>
        );
    }
  };

  const filledCount = positions.filter(
    (p) => p.hiringStatus === "filled" && p.status === "active",
  ).length;
  const vacantCount = positions.filter(
    (p) => p.hiringStatus === "vacant" && p.status === "active",
  ).length;
  const hiringCount = positions.filter(
    (p) => p.hiringStatus === "hiring" && p.status === "active",
  ).length;

  return (
    <>
      <PageHeader title="Positions" subtitle="Manage positions (S)" />
      <main className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {positions.filter((p) => p.status === "active").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Positions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {filledCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Filled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {vacantCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Vacant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {hiringCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Hiring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-card-foreground">
                  All Positions
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search positions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 bg-input"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-input">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="hiring">Hiring</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterUnit} onValueChange={setFilterUnit}>
                    <SelectTrigger className="w-48 bg-input">
                      <SelectValue placeholder="Org Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {organizationalUnits
                        .filter((u) => u.status === "active")
                        .map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleOpenAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Position
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Code
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Org Unit
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Job Class
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Incumbent
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Reports To
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((pos) => (
                    <TableRow key={pos.id} className="border-border">
                      <TableCell className="font-mono text-card-foreground">
                        {pos.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">
                            {pos.title}
                          </p>
                          {pos.focusArea && (
                            <p className="text-xs text-muted-foreground">
                              {pos.focusArea}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pos.organizationalUnitName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pos.jobClassificationTitle}
                      </TableCell>
                      <TableCell>
                        {pos.incumbentName ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-card-foreground">
                              {pos.incumbentName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-destructive/70">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pos.parentPositionTitle || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(pos.hiringStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(pos)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(pos.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingPosition ? "Edit Position" : "Add Position"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="S-XXX"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>FTE</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1"
                    value={formData.fte}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fte: Number.parseFloat(e.target.value),
                      })
                    }
                    className="bg-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Position Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Senior JavaScript Developer #1"
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Classification</Label>
                <Select
                  value={formData.jobClassificationId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, jobClassificationId: v })
                  }
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select job classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobClassifications
                      .filter((j) => j.status === "active")
                      .map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} ({job.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organizational Unit</Label>
                <Select
                  value={formData.organizationalUnitId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, organizationalUnitId: v })
                  }
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select org unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationalUnits
                      .filter((u) => u.status === "active")
                      .map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reports To (Parent Position)</Label>
                <Select
                  value={formData.parentPositionId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, parentPositionId: v })
                  }
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select parent position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {positions
                      .filter(
                        (p) =>
                          p.status === "active" && p.id !== editingPosition?.id,
                      )
                      .map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title} ({pos.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hiring Status</Label>
                  <Select
                    value={formData.hiringStatus}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        hiringStatus: v as Position["hiringStatus"],
                      })
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="hiring">Hiring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select
                    value={formData.workMode}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        workMode: v as Position["workMode"],
                      })
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Center</Label>
                  <Input
                    value={formData.costCenter}
                    onChange={(e) =>
                      setFormData({ ...formData, costCenter: e.target.value })
                    }
                    placeholder="CC-XXX"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Office Location</Label>
                  <Input
                    value={formData.officeLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officeLocation: e.target.value,
                      })
                    }
                    placeholder="e.g. Hanoi HQ"
                    className="bg-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Focus Area</Label>
                <Input
                  value={formData.focusArea}
                  onChange={(e) =>
                    setFormData({ ...formData, focusArea: e.target.value })
                  }
                  placeholder="e.g. React/Next.js"
                  className="bg-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingPosition ? "Save Changes" : "Create Position"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
