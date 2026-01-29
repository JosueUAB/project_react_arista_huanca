import { useEffect, useState, useContext, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Stack,
  Chip,
  TablePagination,
  Paper,
  InputAdornment,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as AssignmentIcon,

  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import type { Task, TaskResponse } from '../../models/task.model';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  partialUpdateTask,
  deleteTask
} from '../../services/task.service';
import { AlertContext } from '../../context/alert/Alert.context';

export const TaskPage = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState('');

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [isDetailsEditing, setIsDetailsEditing] = useState(false);
  const [detailsName, setDetailsName] = useState('');

  const { showAlert } = useContext(AlertContext)!;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log('Loading tasks...', { page: page + 1, limit: rowsPerPage, search: debouncedSearch });
      const response: TaskResponse = await getTasks({
        page: page + 1, 
        limit: rowsPerPage,
        search: debouncedSearch,
        orderby: 'id',
        orderDir: 'DESC'
      });
      console.log('Tasks loaded:', response);
      setTasks(response?.data || []);
      setTotalTasks(response?.total || 0);
    } catch (error) {
      console.error('Error loading tasks:', error);
      showAlert('Error al cargar las tareas', 'error');
      setTasks([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [page, rowsPerPage, debouncedSearch]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskName(task.name);
    } else {
      setEditingTask(null);
      setTaskName('');
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingTask(null);
    setTaskName('');
  };

  const handleView = async (id: number) => {
    try {
      const response = await getTaskById(id);
      let task = (response as any).data || response;
      
      if (task && (task.id === undefined || task.id === null)) {
        console.warn('Task detail missing ID, injecting from props:', id);
        task = { ...task, id: id };
      }
      
      console.log('View Task loaded:', task);
      
      if (!task || task.id === undefined || task.id === null) {
        console.error('Task data is invalid:', task);
        showAlert('Error: No se pudo cargar la información de la tarea', 'error');
        return;
      }

      setViewTask(task);
      setDetailsName(task.name);
      setIsDetailsEditing(false);
      setOpenViewModal(true);
    } catch (error) {
      console.error('Error loading task details:', error);
      showAlert('Error al cargar detalles de la tarea', 'error');
    }
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setViewTask(null);
    setIsDetailsEditing(false);
    setDetailsName('');
  };

  const handleSave = async () => {
    if (!taskName.trim()) return;

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskName);
        showAlert('Tarea actualizada correctamente', 'success');
      } else {
        await createTask(taskName);
        showAlert('Tarea creada correctamente', 'success');
      }
      handleCloseModal();
      loadTasks();
    } catch (error) {
      console.error(error);
      showAlert('Error al guardar la tarea, talvez no estes autenticado o el servidor no responde', 'error');
    }
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.text.secondary,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-xl'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(id);
        
        setTasks(prev => prev.filter(t => t.id !== id));
        setTotalTasks(prev => prev - 1);
        
        Swal.fire({
          title: '¡Eliminado!',
          text: 'La tarea ha sido eliminada.',
          icon: 'success',
          confirmButtonColor: theme.palette.primary.main
        });
        
        if (tasks.length === 1 && page > 0) {
           setPage(prev => prev - 1); 
        } else {
           loadTasks(); 
        }
        return true;
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar la tarea.',
          icon: 'error'
        });
        return false;
      }
    }
    return false;
  };

  const handleToggleDone = async (task: Task) => {
    try {
      await partialUpdateTask(task.id, { done: !task.done });
      setTasks(prev => 
        prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
      );
      
      const message = !task.done 
        ? '¡Tarea completada! Buen trabajo.' 
        : 'Tarea marcada como pendiente.';
        
      showAlert(message, !task.done ? 'success' : 'info');
      
    } catch (error) {
      console.error(error);
      showAlert('Error al actualizar el estado', 'error');
      loadTasks(); 
    }
  };


  const handleDetailToggleStatus = async () => {
    if (!viewTask) return;
    try {
      await partialUpdateTask(viewTask.id, { done: !viewTask.done });
      const updated = { ...viewTask, done: !viewTask.done };
      setViewTask(updated);
      
      setTasks(prev => 
        prev.map(t => t.id === updated.id ? updated : t)
      );
      
      showAlert(
        updated.done ? '¡Tarea completada!' : 'Tarea pendiente.', 
        updated.done ? 'success' : 'info'
      );
    } catch (error) {
      console.error(error);
      showAlert('Error al actualizar estado', 'error');
    }
  };

  const handleDetailSaveName = async () => {
    if (!viewTask || !detailsName.trim()) return;
    try {
      await updateTask(viewTask.id, detailsName);
      const updated = { ...viewTask, name: detailsName };
      setViewTask(updated);
      
      setTasks(prev => 
        prev.map(t => t.id === updated.id ? updated : t)
      );
      
      setIsDetailsEditing(false);
      showAlert('Tarea actualizada', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Error al actualizar tarea', 'error');
    }
  };

  const handleDetailDelete = async () => {
    if (!viewTask) return;
    const deleted = await handleDelete(viewTask.id);
    if (deleted) {
      handleCloseViewModal();
    }
  };

  const swalZIndexFix = `
    .swal2-container {
      z-index: 2000 !important;
    }
  `;

  return (
    <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
      <style>{swalZIndexFix}</style>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon fontSize="large" color="primary" />
          Gestión de Tareas
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: { sm: 400 } }}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ 
              px: 4, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[4]
            }}
          >
            Nueva Tarea
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tarea</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fecha Creación</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2 }} color="text.secondary">Cargando tareas...</Typography>
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                      <AssignmentIcon sx={{ fontSize: 60, mb: 2, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">No se encontraron tareas</Typography>
                      {searchTerm && <Typography variant="body2">Intenta con otro término de búsqueda</Typography>}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task, index) => (
                  <TableRow key={task.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          textDecoration: task.done ? 'line-through' : 'none',
                          color: task.done ? 'text.disabled' : 'text.primary',
                          transition: 'all 0.3s'
                        }}
                      >
                        {task.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={task.done ? "Clic para marcar como PENDIENTE" : "Clic para marcar como FINALIZADA"} arrow>
                        <Chip 
                          icon={task.done ? <CheckCircleIcon /> : <UncheckedIcon />}
                          label={task.done ? "Finalizada" : "Pendiente"}
                          color={task.done ? "success" : "default"}
                          variant={task.done ? "filled" : "outlined"}
                          onClick={() => handleToggleDone(task)}
                          sx={{ 
                            cursor: 'pointer', 
                            fontWeight: 500,
                            minWidth: 120, 
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: 2
                            }
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'text.secondary' }}>
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Ver detalles" arrow>
                          <IconButton 
                            onClick={() => handleView(task.id)}
                            sx={{ color: theme.palette.info.main, '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar" arrow>
                          <IconButton 
                            onClick={() => handleOpenModal(task)}
                            disabled={task.done}
                            sx={{ color: theme.palette.warning.main, '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) } }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar" arrow>
                          <IconButton 
                            onClick={() => handleDelete(task.id)}
                            sx={{ color: theme.palette.error.main, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30, 50]}
          component="div"
          count={totalTasks}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </Paper>

      <Dialog 
        open={openModal} 
        onClose={handleCloseModal} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Descripción de la tarea"
              placeholder="Ej: Estudiar React avanzado"
              type="text"
              fullWidth
              variant="outlined"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 4 }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!taskName.trim()}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
       <Dialog 
         open={openViewModal} 
         onClose={handleCloseViewModal} 
         fullWidth 
         maxWidth="xs"
         TransitionComponent={Zoom}
         PaperProps={{ sx: { borderRadius: 3 } }}
       >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Detalles de la Tarea
            </Typography>
            <IconButton size="small" onClick={handleCloseViewModal}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          {viewTask && (
            <Stack spacing={3}>
              {/* Status Section - Editable */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                <Tooltip title={viewTask.done ? "Clic para marcar como PENDIENTE" : "Clic para marcar como FINALIZADA"}>
                  <Chip 
                    icon={viewTask.done ? <CheckCircleIcon /> : <UncheckedIcon />}
                    label={viewTask.done ? "FINALIZADA" : "PENDIENTE"} 
                    color={viewTask.done ? "success" : "warning"} 
                    onClick={handleDetailToggleStatus}
                    sx={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem', 
                      px: 2, 
                      py: 2.5, 
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 2
                          }
                    }}
                  />
                </Tooltip>
                
                {viewTask.done && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                    * Tarea finalizada. No se puede editar la descripción.
                  </Typography>
                )}
              </Box>

             
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <AssignmentIcon fontSize="small" /> NOMBRE DE LA TAREA
                </Typography>
                
                {isDetailsEditing ? (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField 
                      fullWidth 
                      value={detailsName} 
                      onChange={(e) => setDetailsName(e.target.value)}
                      multiline
                      variant="outlined"
                      size="small"
                      autoFocus
                    />
                    <IconButton color="primary" onClick={handleDetailSaveName} disabled={!detailsName.trim()}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setIsDetailsEditing(false)}>
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: '1.1rem', 
                        wordBreak: 'break-word',
                        textDecoration: viewTask.done ? 'line-through' : 'none',
                        color: viewTask.done ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {viewTask.name}
                    </Typography>
                    
                    <Tooltip title={viewTask.done ? "La tarea está finalizada" : "Editar nombre"}>
                      <span>
                        <IconButton 
                          size="small" 
                          onClick={() => setIsDetailsEditing(true)} 
                          color="primary"
                          disabled={viewTask.done}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                )}
              </Box>

          
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={handleDetailDelete} 
            color="error" 
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Eliminar
          </Button>
          <Button 
            onClick={handleCloseViewModal} 
            variant="outlined" 
            sx={{ borderRadius: 2 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
